// KV 命名空间绑定名应为 LINKS

function generateRandomSuffix(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const HTML_PAGE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔗 短链接生成器</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      max-width: 650px;
      width: 100%;
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
      background-size: 300% 100%;
      animation: gradient 3s ease infinite;
    }

    @keyframes gradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .title {
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6c757d;
      font-size: 1rem;
      font-weight: 400;
    }

    .form-group {
      margin-bottom: 1.5rem;
      position: relative;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #495057;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      font-size: 1.1rem;
      z-index: 2;
    }

    input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #fff;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      transform: translateY(-1px);
    }

    input::placeholder {
      color: #adb5bd;
    }

    .generate-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .generate-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .generate-btn:active {
      transform: translateY(0);
    }

    .generate-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .result {
      margin-top: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-radius: 12px;
      border-left: 4px solid #28a745;
      word-break: break-word;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result a {
      color: #155724;
      text-decoration: none;
      font-weight: 600;
      border-bottom: 2px solid transparent;
      transition: border-color 0.3s ease;
    }

    .result a:hover {
      border-bottom-color: #155724;
    }

    .error {
      margin-top: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%);
      border-radius: 12px;
      border-left: 4px solid #dc3545;
      color: #721c24;
      animation: slideIn 0.3s ease;
    }

    .qr-code {
      text-align: center;
      margin-top: 1rem;
    }

    .qr-code img {
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .qr-code img:hover {
      transform: scale(1.05);
    }

    .admin-link {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    .admin-link a {
      color: #6c757d;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .admin-link a:hover {
      color: #667eea;
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .container {
        padding: 2rem;
      }

      .title {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">🔗 短链接生成器</h1>
      <p class="subtitle">快速生成美观的短链接，支持密码保护和过期时间设置</p>
    </div>

    <form id="linkForm">
      <div class="form-group">
        <label for="longUrl">🌐 目标链接</label>
        <div class="input-wrapper">
          <span class="input-icon">🔗</span>
          <input type="url" id="longUrl" placeholder="请输入完整的链接地址（如：https://www.example.com）" required>
        </div>
      </div>

      <div class="form-group">
        <label for="shortKey">✨ 自定义后缀（可选）</label>
        <div class="input-wrapper">
          <span class="input-icon">🎯</span>
          <input type="text" id="shortKey" placeholder="自定义短链接后缀，留空则自动生成">
        </div>
      </div>

      <div class="form-group">
        <label for="password">🔒 访问密码（可选）</label>
        <div class="input-wrapper">
          <span class="input-icon">🔐</span>
          <input type="password" id="password" placeholder="设置访问密码以保护链接">
        </div>
      </div>

      <div class="form-group">
        <label for="expiry">⏰ 过期时间（可选）</label>
        <div class="input-wrapper">
          <span class="input-icon">📅</span>
          <input type="datetime-local" id="expiry" placeholder="设置链接过期时间">
        </div>
      </div>

      <button type="submit" class="generate-btn" id="generateBtn">
        <span id="btnText">🚀 生成短链接</span>
      </button>
    </form>

    <div id="output"></div>

    <div class="admin-link">
      <a href="/admin">🛠️ 管理后台</a>
    </div>
  </div>

  <script>
    // 表单提交处理
    document.getElementById('linkForm').addEventListener('submit', function(e) {
      e.preventDefault();
      generateShortLink();
    });

    async function generateShortLink() {
      const longUrlInput = document.getElementById('longUrl');
      const shortKeyInput = document.getElementById('shortKey');
      const passwordInput = document.getElementById('password');
      const expiryInput = document.getElementById('expiry');
      const output = document.getElementById('output');
      const generateBtn = document.getElementById('generateBtn');
      const btnText = document.getElementById('btnText');

      let longUrl = longUrlInput.value.trim();
      let shortKey = shortKeyInput.value.trim();
      let password = passwordInput.value.trim();
      let expiryUTC = '';

      // 清空之前的结果
      output.innerHTML = '';

      if (!longUrl) {
        showError('请输入有效的长链接地址');
        return;
      }

      if (!/^https?:\\/\\//i.test(longUrl)) {
        showError('链接必须以 http:// 或 https:// 开头');
        return;
      }

      if (expiryInput.value) {
        const expiryLocal = new Date(expiryInput.value);
        const now = new Date();
        if (expiryLocal <= now) {
          showError('过期时间必须晚于当前时间');
          return;
        }
        expiryUTC = expiryLocal.toISOString();
      }

      // 显示加载状态
      generateBtn.disabled = true;
      btnText.innerHTML = '🔄 生成中...';

      const encodedUrl = btoa(longUrl);
      const requestUrl = \`/short?longUrl=\${encodeURIComponent(encodedUrl)}\${shortKey ? '&shortKey=' + encodeURIComponent(shortKey) : ''}\${password ? '&password=' + encodeURIComponent(password) : ''}\${expiryUTC ? '&expiry=' + encodeURIComponent(expiryUTC) : ''}\`;

      try {
        const res = await fetch(requestUrl);
        const data = await res.json();

        if (data.Code === 1) {
          showSuccess(data.ShortUrl);
          // 清空表单（除了长链接）
          shortKeyInput.value = '';
          passwordInput.value = '';
          expiryInput.value = '';
        } else {
          showError(data.Message);
        }
      } catch (error) {
        showError('网络请求失败，请检查网络连接后重试');
      } finally {
        // 恢复按钮状态
        generateBtn.disabled = false;
        btnText.innerHTML = '🚀 生成短链接';
      }
    }

    function showSuccess(shortUrl) {
      const output = document.getElementById('output');
      output.innerHTML = \`
        <div class="result">
          <div style="margin-bottom: 1rem;">
            <strong>✅ 短链接生成成功！</strong>
          </div>
          <div style="margin-bottom: 1rem;">
            <strong>🔗 短链接：</strong>
            <a href="\${shortUrl}" target="_blank" onclick="copyToClipboard('\${shortUrl}')">\${shortUrl}</a>
            <button onclick="copyToClipboard('\${shortUrl}')" style="margin-left: 0.5rem; padding: 0.3rem 0.6rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">📋 复制</button>
          </div>
          <div class="qr-code">
            <strong>� 扫码访问：</strong><br>
            <div id="qrcode" style="margin-top: 0.5rem; display: flex; justify-content: center;"></div>
          </div>
        </div>
      \`;

      // 生成二维码
      generateQRCode(shortUrl);
    }

    function generateQRCode(url) {
      const qrCodeContainer = document.getElementById('qrcode');

      // 清空容器
      qrCodeContainer.innerHTML = '';

      try {
        // 使用正确的QRCode.js语法生成二维码
        const qrcode = new QRCode(qrCodeContainer, {
          text: url,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });

        // 等待二维码生成完成后添加样式
        setTimeout(() => {
          const img = qrCodeContainer.querySelector('img');
          const canvas = qrCodeContainer.querySelector('canvas');
          const element = img || canvas;

          if (element) {
            element.style.borderRadius = '12px';
            element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
            element.style.transition = 'transform 0.3s ease';
            element.style.cursor = 'pointer';

            element.addEventListener('mouseenter', function() {
              this.style.transform = 'scale(1.05)';
            });
            element.addEventListener('mouseleave', function() {
              this.style.transform = 'scale(1)';
            });

            // 添加点击复制功能
            element.addEventListener('click', function() {
              copyToClipboard(url);
            });
          }
        }, 100);

      } catch (error) {
        console.error('QR Code generation failed:', error);
        qrCodeContainer.innerHTML = '<div style="width: 200px; height: 200px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #6c757d;">二维码生成失败</div>';
      }
    }

    function showError(message) {
      const output = document.getElementById('output');
      output.innerHTML = \`
        <div class="error">
          <strong>❌ 错误：</strong>\${message}
        </div>
      \`;
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(function() {
        // 临时显示复制成功提示
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '✅ 已复制';
        button.style.background = '#28a745';
        setTimeout(() => {
          button.innerHTML = originalText;
          button.style.background = '#28a745';
        }, 2000);
      }).catch(function() {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('链接已复制到剪贴板');
      });
    }

    // 输入验证
    document.getElementById('longUrl').addEventListener('input', function() {
      const url = this.value.trim();
      if (url && !/^https?:\\/\\//i.test(url)) {
        this.style.borderColor = '#dc3545';
      } else {
        this.style.borderColor = '#e9ecef';
      }
    });

    document.getElementById('shortKey').addEventListener('input', function() {
      const key = this.value.trim();
      // 只允许字母数字和部分特殊字符
      if (key && !/^[a-zA-Z0-9_-]*$/.test(key)) {
        this.style.borderColor = '#dc3545';
      } else {
        this.style.borderColor = '#e9ecef';
      }
    });
  </script>
</body>
</html>
`;

// 全局变量用于存储环境变量
let globalEnv = null;

async function handleRequest(request, env = globalEnv) {
  const url = new URL(request.url);
  let targetUrl = url.searchParams.get('longUrl');
  let customSuffix = url.searchParams.get('shortKey');
  let password = url.searchParams.get('password');
  let expiry = url.searchParams.get('expiry');

  if (!targetUrl) {
    return new Response(JSON.stringify({
      Code: 201,
      Message: 'failed to get long URL, please check the short URL if exists or expired'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    targetUrl = atob(targetUrl);
  } catch (err) {
    return new Response(JSON.stringify({
      Code: 201,
      Message: 'failed to decode long URL, please check if it is properly encoded'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 检查是否包含“dour.in”
  if (/dour\.in/i.test(targetUrl)) {
    return new Response(JSON.stringify({
      Code: 201,
      Message: '禁止生成指向 dour.in 域名的短链接'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 检查是否包含被中国大陆认定为邪教或明显反共的网站
  // 常见日常网站如YouTube、Telegram、Facebook、X不算
  const sensitiveDomains = [
    // 典型邪教、反共、法轮功等相关域名关键词（部分示例，实际可补充）
    'falundafa', 'falunhr', 'minghui', 'epochtimes', 'soundofhope', 'ntdtv',
    'boxun', 'aboluowang', 'zhengjian', 'secretchina', 'dongtaiwang',
    'wujieliulan', 'renminbao', 'dajiyuan', 'zhengwunet', 'xinsheng',
    'canyu', 'chinadigitaltimes', 'pincong', 'chinawiki', 'chinadissident',
    'tuidang', 'shenyun', 'shenyunperformingarts', 'shenyunshop',
    'shenyuncreations', 'shenyuncollections',
    // 其他典型反共、煽动颠覆、邪教等（可补充）
    'boxun', 'aboluowang', 'epochweekly', 'epochtimes', 'ntdtv',
    'secretchina', 'dongtaiwang', 'renminbao', 'dajiyuan', 'zhengjian',
    'xinsheng', 'canyu', 'chinadigitaltimes', 'pincong', 'chinawiki',
    'chinadissident', 'tuidang', 'shenyun', 'shenyunperformingarts',
    'shenyunshop', 'shenyuncreations', 'shenyuncollections',
    // 典型法轮功、反共等相关域名
    'falun', 'minghui', 'epochtimes', 'ntdtv', 'soundofhope',
    // 其他可补充
  ];
  // 排除常见日常网站
  const whitelist = [
    'youtube.com', 'youtu.be', 'telegram.org', 't.me', 'facebook.com', 'fb.com', 'twitter.com', 'x.com'
  ];
  const urlLower = targetUrl.toLowerCase();
  const isWhitelisted = whitelist.some(domain => urlLower.includes(domain));
  if (!isWhitelisted) {
    if (sensitiveDomains.some(domain => urlLower.includes(domain))) {
      return new Response(JSON.stringify({
        Code: 201,
        Message: '禁止生成指向被中国大陆认定为邪教或反共的网站的短链接'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    return new Response(JSON.stringify({
      Code: 201,
      Message: 'Invalid URL: must start with http:// or https://'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const suffix = customSuffix || generateRandomSuffix(6);
  const workerDomain = request.headers.get('host');

  const existing = await env.LINKS.get(suffix);
  if (existing) {
    return new Response(JSON.stringify({
      Code: 201,
      Message: 'short key already exists, please use another one or leave it empty to generate automatically.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let hashedPassword = null;
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  const data = {
    longUrl: targetUrl,
    password: hashedPassword,
    expiry: expiry || null
  };

  await env.LINKS.put(suffix, JSON.stringify(data));

  const shortLink = `https://${workerDomain}/${suffix}`;

  return new Response(JSON.stringify({
    Code: 1,
    ShortUrl: shortLink
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleRedirect(request, env = globalEnv) {
  const url = new URL(request.url);
  const suffix = url.pathname.slice(1);
  const hasError = url.searchParams.get('error');

  const data = await env.LINKS.get(suffix, 'json');
  if (!data) {
    const errorPage = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>❌ 链接不存在</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            margin: 0;
          }
          .error-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 450px;
          }
          .error-icon { font-size: 4rem; margin-bottom: 1rem; }
          .error-title { font-size: 1.8rem; font-weight: 700; color: #dc3545; margin-bottom: 1rem; }
          .error-message { color: #6c757d; margin-bottom: 2rem; }
          .back-btn {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: transform 0.3s ease;
          }
          .back-btn:hover { transform: translateY(-2px); }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">🔍</div>
          <h1 class="error-title">链接不存在</h1>
          <p class="error-message">抱歉，您访问的短链接不存在或已被删除</p>
          <a href="/" class="back-btn">🏠 返回首页</a>
        </div>
      </body>
      </html>
    `;
    return new Response(errorPage, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    });
  }

  const { longUrl, password, expiry } = data;

  if (expiry && new Date() > new Date(expiry)) {
    const expiredPage = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>⏰ 链接已过期</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            margin: 0;
          }
          .error-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 450px;
          }
          .error-icon { font-size: 4rem; margin-bottom: 1rem; }
          .error-title { font-size: 1.8rem; font-weight: 700; color: #ffc107; margin-bottom: 1rem; }
          .error-message { color: #6c757d; margin-bottom: 2rem; }
          .back-btn {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: transform 0.3s ease;
          }
          .back-btn:hover { transform: translateY(-2px); }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⏰</div>
          <h1 class="error-title">链接已过期</h1>
          <p class="error-message">抱歉，此短链接已过期，无法继续访问</p>
          <a href="/" class="back-btn">🏠 返回首页</a>
        </div>
      </body>
      </html>
    `;
    return new Response(expiredPage, {
      status: 410,
      headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    });
  }

  if (password) {
    const hasError = url.searchParams.get('error');
    const passwordPage = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔒 密码保护</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .password-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
            width: 100%;
            max-width: 450px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .password-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
            background-size: 300% 100%;
            animation: gradient 3s ease infinite;
          }

          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .lock-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 0.5rem;
          }

          .subtitle {
            color: #6c757d;
            margin-bottom: 2.5rem;
            font-size: 1rem;
          }

          .form-group {
            margin-bottom: 2rem;
            text-align: left;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #495057;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .input-wrapper {
            position: relative;
          }

          .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            font-size: 1.1rem;
            z-index: 2;
          }

          input[type="password"] {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: #fff;
          }

          input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-1px);
          }

          input[type="password"]::placeholder {
            color: #adb5bd;
          }

          .submit-btn {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 1.5rem;
          }

          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          }

          .submit-btn:active {
            transform: translateY(0);
          }

          .back-link {
            text-align: center;
          }

          .back-link a {
            color: #6c757d;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.3s ease;
          }

          .back-link a:hover {
            color: #667eea;
          }

          .error-message {
            background: linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%);
            border-left: 4px solid #dc3545;
            color: #721c24;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            body {
              padding: 1rem;
            }

            .password-container {
              padding: 2rem;
            }

            .title {
              font-size: 1.5rem;
            }

            .lock-icon {
              font-size: 3rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="password-container">
          <div class="lock-icon">🔒</div>
          <h1 class="title">密码保护</h1>
          <p class="subtitle">此短链接受密码保护，请输入正确的访问密码</p>

          <form action="/check_password" method="POST" id="passwordForm">
            <input type="hidden" name="suffix" value="${suffix}">

            <div class="form-group">
              <label for="password">🔐 访问密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔑</span>
                <input type="password" id="password" name="password" placeholder="请输入访问密码" required autofocus>
              </div>
            </div>

            <button type="submit" class="submit-btn" id="submitBtn">
              <span id="btnText">🚀 访问链接</span>
            </button>
          </form>

          <div class="back-link">
            <a href="/">← 返回首页</a>
          </div>
        </div>

        <script>
          document.getElementById('passwordForm').addEventListener('submit', function() {
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');

            submitBtn.disabled = true;
            btnText.innerHTML = '🔄 验证中...';
          });

          // 检查URL参数中是否有错误信息
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          if (error) {
            const passwordContainer = document.querySelector('.password-container');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = '❌ 密码错误，请重新输入正确的访问密码';

            // 在标题后插入错误信息
            const subtitle = document.querySelector('.subtitle');
            subtitle.parentNode.insertBefore(errorDiv, subtitle.nextSibling);

            // 清除URL中的错误参数
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        </script>
      </body>
      </html>
    `;
    return new Response(passwordPage, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    });
  }

  return Response.redirect(longUrl, 301);
}

async function handleCheckPassword(request, env = globalEnv) {
  const formData = await request.formData();
  const suffix = formData.get('suffix');
  const inputPassword = formData.get('password');

  const data = await env.LINKS.get(suffix, 'json');
  if (!data) {
    const errorPage = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>❌ 链接不存在</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            margin: 0;
          }
          .error-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 450px;
          }
          .error-icon { font-size: 4rem; margin-bottom: 1rem; }
          .error-title { font-size: 1.8rem; font-weight: 700; color: #dc3545; margin-bottom: 1rem; }
          .error-message { color: #6c757d; margin-bottom: 2rem; }
          .back-btn {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: transform 0.3s ease;
          }
          .back-btn:hover { transform: translateY(-2px); }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">🔍</div>
          <h1 class="error-title">链接不存在</h1>
          <p class="error-message">抱歉，您访问的短链接不存在或已被删除</p>
          <a href="/" class="back-btn">🏠 返回首页</a>
        </div>
      </body>
      </html>
    `;
    return new Response(errorPage, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    });
  }

  const { longUrl, password, expiry } = data;

  // 检查是否过期
  if (expiry && new Date() > new Date(expiry)) {
    const expiredPage = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>⏰ 链接已过期</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            margin: 0;
          }
          .error-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 450px;
          }
          .error-icon { font-size: 4rem; margin-bottom: 1rem; }
          .error-title { font-size: 1.8rem; font-weight: 700; color: #ffc107; margin-bottom: 1rem; }
          .error-message { color: #6c757d; margin-bottom: 2rem; }
          .back-btn {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: transform 0.3s ease;
          }
          .back-btn:hover { transform: translateY(-2px); }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⏰</div>
          <h1 class="error-title">链接已过期</h1>
          <p class="error-message">抱歉，此短链接已过期，无法继续访问</p>
          <a href="/" class="back-btn">🏠 返回首页</a>
        </div>
      </body>
      </html>
    `;
    return new Response(expiredPage, {
      status: 410,
      headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    });
  }

  if (!password) {
    return Response.redirect(longUrl, 301);
  }

  const hashedInput = await hashPassword(inputPassword);
  if (hashedInput === password) {
    return Response.redirect(longUrl, 301);
  } else {
    // 密码错误，重定向回密码页面并显示错误
    const url = new URL(request.url);
    return Response.redirect(`${url.origin}/${suffix}?error=1`, 302);
  }
}

// 验证管理密码
async function verifyAdminPassword(password, env) {
  const adminPassword = env.ADMIN_PASSWORD;
  return password === adminPassword;
}

// 管理后台页面 - 集成登录和管理功能
async function handleAdmin(request, env) {
  // 如果是POST请求，处理密码验证
  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password');

    if (await verifyAdminPassword(password, env)) {
      // 密码正确，显示管理界面
      return await showAdminDashboard(request, env);
    } else {
      // 密码错误，显示登录页面并提示错误
      return showAdminLogin('密码错误，请重试');
    }
  }

  // GET请求，显示登录页面
  return showAdminLogin();
}

// 显示登录页面
function showAdminLogin(errorMessage = '') {
  const loginPage = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>管理后台登录</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-container {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .login-title {
          color: #333;
          margin-bottom: 2rem;
          font-size: 1.8rem;
          font-weight: 600;
        }
        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
          font-weight: 500;
        }
        input[type="password"] {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        input[type="password"]:focus {
          outline: none;
          border-color: #667eea;
        }
        .login-btn {
          width: 100%;
          padding: 0.8rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .login-btn:hover {
          transform: translateY(-2px);
        }
        .error {
          color: #e74c3c;
          margin-top: 1rem;
          font-size: 0.9rem;
        }
        .back-link {
          margin-top: 1.5rem;
          text-align: center;
        }
        .back-link a {
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
        }
        .back-link a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h1 class="login-title">🔐 管理后台</h1>
        <form method="POST" action="/admin">
          <div class="form-group">
            <label for="password">管理密码</label>
            <input type="password" id="password" name="password" required autofocus>
          </div>
          <button type="submit" class="login-btn">登录</button>
          ${errorMessage ? `<div class="error">${errorMessage}</div>` : ''}
        </form>
        <div class="back-link">
          <a href="/">← 返回首页</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return new Response(loginPage, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}

// 显示管理面板
async function showAdminDashboard(request, env) {
  const list = await env.LINKS.list();
  // 优化：按创建时间倒序排列，显示创建时间
  const links = await Promise.all(list.keys.map(async key => {
    const data = await env.LINKS.get(key.name, 'json');
    // 尝试获取 KV 的创建时间（如无则用 key.metadata?.createdAt 或 fallback）
    let createdAt = key.metadata?.createdAt;
    if (!createdAt) {
      // 若 metadata 不存在，尝试用 key 的 name 生成时间（如有自定义规则）或 fallback
      createdAt = '未知';
    }
    return {
      suffix: key.name,
      longUrl: data.longUrl,
      hasPassword: !!data.password,
      expiry: data.expiry,
      createdAt
    };
  }));

  // 按创建时间倒序排列（如果有 createdAt 字段且为有效时间）
  links.sort((a, b) => {
    if (a.createdAt === '未知' && b.createdAt === '未知') return 0;
    if (a.createdAt === '未知') return 1;
    if (b.createdAt === '未知') return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const adminPage = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>短链接管理后台</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f8f9fa;
          color: #333;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 {
          font-size: 1.8rem;
          font-weight: 600;
        }
        .stats {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .stat-card {
          background: rgba(255,255,255,0.2);
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          min-width: 120px;
        }
        .stat-number {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }
        .container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 2rem;
        }
        .actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .btn {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .btn-primary {
          background: #667eea;
          color: white;
        }
        .btn-primary:hover {
          background: #5a6fd8;
          transform: translateY(-1px);
        }
        .btn-danger {
          background: #e74c3c;
          color: white;
          font-size: 0.9rem;
          padding: 0.4rem 0.8rem;
        }
        .btn-danger:hover {
          background: #c0392b;
        }
        .search-box {
          padding: 0.6rem 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          width: 300px;
          font-size: 1rem;
        }
        .search-box:focus {
          outline: none;
          border-color: #667eea;
        }
        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #f8f9fa;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #e9ecef;
        }
        td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }
        tr:hover {
          background: #f8f9fa;
        }
        .url-cell {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge {
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .badge-success {
          background: #d4edda;
          color: #155724;
        }
        .badge-secondary {
          background: #e2e3e5;
          color: #383d41;
        }
        .badge-warning {
          background: #fff3cd;
          color: #856404;
        }
        .short-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        .short-link:hover {
          text-decoration: underline;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }
        .empty-state h3 {
          margin-bottom: 1rem;
          color: #495057;
        }
        .logout-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.3);
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1>🔗 短链接管理后台</h1>
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${links.length}</div>
                <div class="stat-label">总链接数</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${links.filter(l => l.hasPassword).length}</div>
                <div class="stat-label">密码保护</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${links.filter(l => l.expiry && new Date(l.expiry) > new Date()).length}</div>
                <div class="stat-label">有效期内</div>
              </div>
            </div>
          </div>
          <a href="/admin" class="btn logout-btn">退出登录</a>
        </div>
      </div>

      <div class="container">
        <div class="actions">
          <input type="text" class="search-box" placeholder="搜索链接..." onkeyup="filterLinks(this.value)">
          <a href="/" class="btn btn-primary">+ 创建新链接</a>
        </div>

        <div class="table-container">
          ${links.length === 0 ? `
            <div class="empty-state">
              <h3>暂无短链接</h3>
              <p>点击"创建新链接"开始创建您的第一个短链接</p>
            </div>
          ` : `
            <table id="linksTable">
              <thead>
                <tr>
                  <th>短链接</th>
                  <th>目标链接</th>
                  <th>状态</th>
                  <th>到期时间</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${links.map(link => `
                  <tr>
                    <td>
                      <a href="/${link.suffix}" target="_blank" class="short-link">
                        ${new URL(request.url).origin}/${link.suffix}
                      </a>
                    </td>
                    <td class="url-cell" title="${link.longUrl}">${link.longUrl}</td>
                    <td>
                      ${link.hasPassword ? '<span class="badge badge-warning">🔒 密码保护</span>' : '<span class="badge badge-success">🔓 公开</span>'}
                    </td>
                    <td>
                      ${link.expiry ?
                        (new Date(link.expiry) > new Date() ?
                          `<span class="badge badge-success">${new Date(link.expiry).toLocaleString()}</span>` :
                          '<span class="badge badge-secondary">已过期</span>'
                        ) :
                        '<span class="badge badge-secondary">永久</span>'
                      }
                    </td>
                    <td>
                      ${link.createdAt && link.createdAt !== '未知' ? new Date(link.createdAt).toLocaleString() : '未知'}
                    </td>
                    <td>
                      <button class="btn btn-danger" onclick="deleteLink('${link.suffix}')">删除</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>

      <script>
        function filterLinks(searchTerm) {
          const table = document.getElementById('linksTable');
          if (!table) return;

          // 只过滤 tbody 下的 tr，避免隐藏表头
          const tbody = table.querySelector('tbody');
          if (!tbody) return;
          const rows = tbody.getElementsByTagName('tr');
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          }
        }

        async function deleteLink(suffix) {
          if (!confirm('确定要删除这个短链接吗？此操作不可恢复。')) {
            return;
          }

          try {
            const response = await fetch('/admin/delete?suffix=' + encodeURIComponent(suffix), {
              method: 'DELETE'
            });

            if (response.ok) {
              location.reload();
            } else {
              alert('删除失败，请重试');
            }
          } catch (error) {
            alert('删除失败：' + error.message);
          }
        }
      </script>
    </body>
    </html>
  `;

  return new Response(adminPage, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}

async function handleDelete(request, env = globalEnv) {
  const url = new URL(request.url);
  const suffix = url.searchParams.get('suffix');
  if (!suffix) {
    return new Response('Missing suffix', { status: 400 });
  }

  try {
    // 检查是否存在
    const exist = await env.LINKS.get(suffix);
    if (!exist) {
      return new Response('Not found', { status: 404 });
    }
    await env.LINKS.delete(suffix);
    return new Response('Deleted', { status: 200 });
  } catch (e) {
    return new Response('Delete failed: ' + (e && e.message ? e.message : e), { status: 500 });
  }
}

export default {
  async fetch(request, env, ctx) {
    // 设置全局环境变量
    globalEnv = env;

    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/') {
      return new Response(HTML_PAGE, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    } else if (pathname === '/short') {
      return handleRequest(request, env);
    } else if (pathname === '/check_password' && request.method === 'POST') {
      return handleCheckPassword(request, env);
    } else if (pathname === '/admin') {
      // 管理后台 - 处理GET(显示登录)和POST(验证密码)
      return handleAdmin(request, env);
    } else if (pathname === '/admin/delete' && request.method === 'DELETE') {
      return handleDelete(request, env);
    } else if (pathname.length > 1) {
      return handleRedirect(request, env);
    } else {
      return new Response('Not Found', { status: 404 });
    }
  }
};
