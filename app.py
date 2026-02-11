#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
八字排盘Web API
提供RESTful接口供前端调用
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import subprocess
import json
import re
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 允许跨域请求

def parse_bazi_output(output):
    """
    解析bazi.py的输出，提取关键信息
    """
    lines = output.split('\n')
    result = {
        'basic': {},
        'wuxing': {},
        'shishen': {},
        'dayun': [],
        'geju': [],
        'shensha': [],
        'analysis': [],
        'raw_output': output
    }
    
    # 提取基本信息
    for line in lines[:50]:
        if '公历:' in line:
            result['basic']['solar'] = line.split('公历:')[1].strip().split()[0] if '公历:' in line else ''
        if '农历:' in line:
            result['basic']['lunar'] = line.split('农历:')[1].strip().split()[0] if '农历:' in line else ''
        if '命宫:' in line:
            match = re.search(r'命宫:(\S+)', line)
            if match:
                result['basic']['minggong'] = match.group(1)
        if '胎元:' in line:
            match = re.search(r'胎元:(\S+)', line)
            if match:
                result['basic']['taiyuan'] = match.group(1)
    
    # 提取四柱
    for i, line in enumerate(lines):
        if '丁 己 癸 壬' in line or re.search(r'[甲乙丙丁戊己庚辛壬癸]\s+[甲乙丙丁戊己庚辛壬癸]\s+[甲乙丙丁戊己庚辛壬癸]\s+[甲乙丙丁戊己庚辛壬癸]', line):
            # 天干
            gans = re.findall(r'[甲乙丙丁戊己庚辛壬癸]', line)
            if len(gans) >= 4:
                result['basic']['gans'] = gans[:4]
            # 地支在下一行
            if i + 1 < len(lines):
                zhis = re.findall(r'[子丑寅卯辰巳午未申酉戌亥]', lines[i+1])
                if len(zhis) >= 4:
                    result['basic']['zhis'] = zhis[:4]
            break
    
    # 提取五行分数
    for line in lines:
        if '五行分数' in line:
            match = re.search(r"\{'金':\s*(\d+),\s*'木':\s*(\d+),\s*'水':\s*(\d+),\s*'火':\s*(\d+),\s*'土':\s*(\d+)\}", line)
            if match:
                result['wuxing'] = {
                    '金': int(match.group(1)),
                    '木': int(match.group(2)),
                    '水': int(match.group(3)),
                    '火': int(match.group(4)),
                    '土': int(match.group(5))
                }
        if '八字强弱' in line:
            match = re.search(r'强弱[：:]\s*(\d+)', line)
            if match:
                result['wuxing']['strength'] = int(match.group(1))
            if 'weak: True' in line or '强根: 无' in line:
                result['wuxing']['is_weak'] = True
            else:
                result['wuxing']['is_weak'] = False
    
    # 提取格局
    for line in lines:
        if '格局选用：' in line or '局' in line and '格' in line:
            result['geju'].append(line.strip())
    
    # 提取神煞
    shensha_keywords = ['天乙', '驿马', '桃花', '华盖', '将星', '文昌', '劫煞', '空亡', '天罗', '地网']
    for line in lines:
        for keyword in shensha_keywords:
            if keyword in line:
                result['shensha'].append(line.strip())
                break
    
    # 提取重要分析
    analysis_keywords = ['建禄格', '阳刃格', '食神', '伤官', '财格', '官格', '杀格', '印格', 
                        '比劫', '偏印', '正印', '偏财', '正财', '七杀', '正官']
    for line in lines:
        for keyword in analysis_keywords:
            if keyword in line and len(line.strip()) > 10:
                result['analysis'].append(line.strip())
                break
    
    return result

@app.route('/')
def index():
    """主页"""
    try:
        return render_template('index.html')
    except Exception as e:
        return f"Error loading template: {str(e)}<br>Template folder: {app.template_folder}<br>Static folder: {app.static_folder}", 500

@app.route('/test')
def test():
    """测试页面"""
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>测试</title></head>
    <body>
        <h1>Flask正常工作!</h1>
        <p>如果你能看到这个，说明服务器运行正常</p>
        <a href="/">返回主页</a>
    </body>
    </html>
    '''

@app.route('/api/calculate', methods=['POST'])
def calculate_bazi():
    """
    计算八字API
    接收JSON格式: {
        "year": 1977,
        "month": 8,
        "day": 11,
        "hour": 19,
        "is_solar": false,
        "is_female": true,
        "is_leap": false
    }
    """
    try:
        data = request.get_json()
        
        # 验证必需参数
        required = ['year', 'month', 'day', 'hour']
        for field in required:
            if field not in data:
                return jsonify({'error': f'缺少必需参数: {field}'}), 400
        
        # 构建命令
        cmd = [
            'python3', 'bazi.py',
            str(data['year']),
            str(data['month']),
            str(data['day']),
            str(data['hour'])
        ]
        
        # 添加可选参数
        if data.get('is_solar', False):
            cmd.append('-g')
        if data.get('is_female', False):
            cmd.append('-n')
        if data.get('is_leap', False):
            cmd.append('-r')
        
        # 执行命令
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=30
        )
        
        if result.returncode != 0:
            return jsonify({
                'error': '计算失败',
                'details': result.stderr
            }), 500
        
        # 解析输出
        parsed_result = parse_bazi_output(result.stdout)
        
        return jsonify({
            'success': True,
            'data': parsed_result
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': '计算超时'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calculate_direct', methods=['POST'])
def calculate_bazi_direct():
    """
    直接输入八字计算
    接收JSON格式: {
        "bazi": "丁巳 己酉 癸未 壬戌"
    }
    """
    try:
        data = request.get_json()
        
        if 'bazi' not in data:
            return jsonify({'error': '缺少八字参数'}), 400
        
        bazi = data['bazi'].strip()
        parts = bazi.split()
        
        if len(parts) != 4:
            return jsonify({'error': '八字格式错误，应为4柱，如: 丁巳 己酉 癸未 壬戌'}), 400
        
        # 构建命令
        cmd = ['python3', 'bazi.py', '-b'] + parts
        
        # 执行命令
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=30
        )
        
        if result.returncode != 0:
            return jsonify({
                'error': '计算失败',
                'details': result.stderr
            }), 500
        
        # 解析输出
        parsed_result = parse_bazi_output(result.stdout)
        
        return jsonify({
            'success': True,
            'data': parsed_result
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': '计算超时'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)