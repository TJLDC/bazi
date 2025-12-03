// 八字排盘系统前端交互逻辑

// 全局变量
let currentResult = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 绑定输入模式切换
    const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
    inputModeRadios.forEach(radio => {
        radio.addEventListener('change', toggleInputMode);
    });

    // 绑定计算按钮
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', handleCalculate);


    // 设置默认日期为今天
    setDefaultDate();
}

// 切换输入模式
function toggleInputMode() {
    const mode = document.querySelector('input[name="inputMode"]:checked').value;
    const dateInput = document.getElementById('dateInput');
    const baziInput = document.getElementById('baziInput');

    if (mode === 'date') {
        dateInput.style.display = 'block';
        baziInput.style.display = 'none';
    } else {
        dateInput.style.display = 'none';
        baziInput.style.display = 'block';
    }
}

// 设置默认日期
function setDefaultDate() {
    const now = new Date();
    document.getElementById('year').value = now.getFullYear();
    document.getElementById('month').value = now.getMonth() + 1;
    document.getElementById('day').value = now.getDate();
}

// 处理计算请求
async function handleCalculate() {
    const mode = document.querySelector('input[name="inputMode"]:checked').value;

    // 隐藏之前的结果和错误
    hideElement('resultSection');
    hideElement('error');

    if (mode === 'date') {
        await calculateByDate();
    } else {
        await calculateByBazi();
    }
}

// 通过日期计算
async function calculateByDate() {
    // 获取输入值
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    const hour = document.getElementById('hour').value;
    const isSolar = document.querySelector('input[name="calendar"]:checked').value === 'solar';
    const isFemale = document.querySelector('input[name="gender"]:checked').value === 'female';
    const isLeap = document.getElementById('isLeap').checked;

    // 验证输入
    if (!year || !month || !day || hour === '') {
        showError('请填写完整的日期时间信息');
        return;
    }

    // 构建请求数据
    const data = {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        is_solar: isSolar,
        is_female: isFemale,
        is_leap: isLeap
    };

    // 发送请求
    await sendCalculateRequest('/api/calculate', data);
}

// 通过八字计算
async function calculateByBazi() {
    const baziText = document.getElementById('baziText').value.trim();

    if (!baziText) {
        showError('请输入八字');
        return;
    }

    // 验证八字格式
    const parts = baziText.split(/\s+/);
    if (parts.length !== 4) {
        showError('八字格式错误，应为4柱，用空格分隔，如: 丁巳 己酉 癸未 壬戌');
        return;
    }

    // 构建请求数据
    const data = {
        bazi: baziText
    };

    // 发送请求
    await sendCalculateRequest('/api/calculate_direct', data);
}

// 发送计算请求
async function sendCalculateRequest(url, data) {
    showLoading();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            currentResult = result.data;
            displayResult(result.data);
        } else {
            showError(result.error || '计算失败');
        }
    } catch (error) {
        showError('网络错误: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 显示结果
function displayResult(data) {
    // 显示基本信息
    displayBasicInfo(data.basic);

    // 显示四柱
    displaySizhu(data.basic);

    // 显示原始输出
    displayRawOutput(data.raw_output);

    // 显示结果区域
    showElement('resultSection');

    // 滚动到结果
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// 显示基本信息
function displayBasicInfo(basic) {
    const container = document.getElementById('basicInfo');
    container.innerHTML = '';

    const info = [
        { label: '公历', value: basic.solar || '未知' },
        { label: '农历', value: basic.lunar || '未知' },
        { label: '命宫', value: basic.minggong || '未知' },
        { label: '胎元', value: basic.taiyuan || '未知' }
    ];

    info.forEach(item => {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `
            <div class="info-label">${item.label}</div>
            <div class="info-value">${item.value}</div>
        `;
        container.appendChild(div);
    });
}

// 显示四柱
function displaySizhu(basic) {
    const container = document.getElementById('sizhu');
    container.innerHTML = '';

    if (!basic.gans || !basic.zhis) {
        container.innerHTML = '<p>四柱信息不完整</p>';
        return;
    }

    const labels = ['年柱', '月柱', '日柱', '时柱'];
    
    for (let i = 0; i < 4; i++) {
        const column = document.createElement('div');
        column.className = 'sizhu-column';
        column.innerHTML = `
            <div class="sizhu-label">${labels[i]}</div>
            <div class="sizhu-gan">${basic.gans[i] || '?'}</div>
            <div class="sizhu-zhi">${basic.zhis[i] || '?'}</div>
        `;
        container.appendChild(column);
    }
}

// 显示五行
function displayWuxing(wuxing) {
    const chartContainer = document.getElementById('wuxingChart');
    const infoContainer = document.getElementById('wuxingInfo');
    
    chartContainer.innerHTML = '';
    infoContainer.innerHTML = '';

    if (!wuxing || Object.keys(wuxing).length === 0) {
        chartContainer.innerHTML = '<p>五行信息不可用</p>';
        return;
    }

    // 计算最大值用于比例
    const elements = ['金', '木', '水', '火', '土'];
    const maxValue = Math.max(...elements.map(e => wuxing[e] || 0));

    // 创建柱状图
    elements.forEach(element => {
        const value = wuxing[element] || 0;
        const percentage = maxValue > 0 ? (value / maxValue * 100) : 0;
        
        const bar = document.createElement('div');
        bar.className = 'wuxing-bar';
        bar.innerHTML = `
            <div class="wuxing-label">${element}</div>
            <div class="wuxing-progress">
                <div class="wuxing-fill wuxing-${element.toLowerCase()}" 
                     style="width: ${percentage}%">
                    ${value}
                </div>
            </div>
        `;
        chartContainer.appendChild(bar);
    });

    // 显示五行信息
    const strength = wuxing.strength || 0;
    const isWeak = wuxing.is_weak ? '身弱' : '身强';
    
    infoContainer.innerHTML = `
        <p><strong>八字强弱:</strong> ${strength} (${isWeak})</p>
        <p><strong>判断标准:</strong> 通常>29为强</p>
        <p><strong>五行总分:</strong> ${elements.reduce((sum, e) => sum + (wuxing[e] || 0), 0)}</p>
    `;
}

// 显示格局神煞
function displayGejuShensha(geju, shensha) {
    const container = document.getElementById('gejuShensha');
    container.innerHTML = '';

    // 显示格局
    if (geju && geju.length > 0) {
        const title = document.createElement('h3');
        title.textContent = '格局';
        title.style.marginBottom = '10px';
        container.appendChild(title);

        geju.forEach(item => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = item;
            container.appendChild(tag);
        });
    }

    // 显示神煞
    if (shensha && shensha.length > 0) {
        const title = document.createElement('h3');
        title.textContent = '神煞';
        title.style.marginTop = '20px';
        title.style.marginBottom = '10px';
        container.appendChild(title);

        shensha.forEach(item => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = item;
            container.appendChild(tag);
        });
    }

    if ((!geju || geju.length === 0) && (!shensha || shensha.length === 0)) {
        container.innerHTML = '<p>暂无格局神煞信息</p>';
    }
}

// 显示详细分析
function displayAnalysis(analysis) {
    const container = document.getElementById('analysis');
    container.innerHTML = '';

    if (!analysis || analysis.length === 0) {
        container.innerHTML = '<p>暂无详细分析</p>';
        return;
    }

    // 只显示前20条重要分析
    const displayItems = analysis.slice(0, 20);
    
    displayItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'analysis-item';
        div.textContent = item;
        container.appendChild(div);
    });

    if (analysis.length > 20) {
        const more = document.createElement('p');
        more.style.textAlign = 'center';
        more.style.color = '#666';
        more.style.marginTop = '15px';
        more.textContent = `还有 ${analysis.length - 20} 条分析，请查看完整报告`;
        container.appendChild(more);
    }
}

// 显示原始输出
function displayRawOutput(output) {
    const container = document.getElementById('rawOutput');
    container.textContent = output || '无输出';
}

// 切换原始输出显示
function toggleRawOutput() {
    const output = document.getElementById('rawOutput');
    if (output.style.display === 'none') {
        output.style.display = 'block';
    } else {
        output.style.display = 'none';
    }
}

// 显示加载状态
function showLoading() {
    showElement('loading');
}

// 隐藏加载状态
function hideLoading() {
    hideElement('loading');
}

// 显示错误
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '❌ ' + message;
    showElement('error');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        hideElement('error');
    }, 5000);
}

// 显示元素
function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'block';
    }
}

// 隐藏元素
function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'none';
    }
}