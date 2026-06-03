# 📧 Modelos de E-mail Clerk - Análises UNINASSAU

Para aplicar estes estilos e traduções, você deve acessar o seu **[Painel do Clerk](https://dashboard.clerk.com/)**, ir em **Customization > Emails** e colar os códigos abaixo nos campos correspondentes.

---

## 🎨 Estilos Globais (CSS)
Use estas cores para manter a identidade visual:
- **Azul Primário:** `#003366`
- **Laranja Destaque:** `#f97316`
- **Fundo:** `#f4f7fa`
- **Texto:** `#1a202c`

---

## 1. Código de Verificação (OTP)
**Assunto:** `{{code}} é o seu código de verificação para Análises UNINASSAU`

### 📝 Template HTML:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; }
    .card { background-color: #ffffff; padding: 40px; border-radius: 12px; border-top: 6px solid #003366; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .logo { text-align: center; margin-bottom: 25px; }
    .title { color: #003366; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; }
    .text { color: #4a5568; line-height: 1.6; font-size: 16px; text-align: center; }
    .code-container { background-color: #e6f0ff; padding: 20px; border-radius: 8px; margin: 30px auto; text-align: center; width: fit-content; }
    .code { color: #003366; font-size: 36px; font-weight: 800; letter-spacing: 5px; margin: 0; }
    .footer { text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="title">Verifique seu acesso</div>
      <p class="text">Olá!</p>
      <p class="text">Para concluir seu login ou cadastro no <strong>Análises UNINASSAU</strong>, utilize o código de segurança abaixo:</p>
      <div class="code-container">
        <h1 class="code">{{code}}</h1>
      </div>
      <p class="text">Este código expira em breve. Se você não solicitou este acesso, pode ignorar este e-mail com segurança.</p>
    </div>
    <div class="footer">
      © 2026 UNINASSAU - Análises UNINASSAU<br>
      Sistema de Inteligência e Captação
    </div>
  </div>
</body>
</html>
```

---

## 2. Redefinição de Senha
**Assunto:** `Redefina sua senha - Análises UNINASSAU`

### 📝 Template HTML:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; }
    .card { background-color: #ffffff; padding: 40px; border-radius: 12px; border-top: 6px solid #f97316; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .title { color: #1a202c; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; }
    .text { color: #4a5568; line-height: 1.6; font-size: 16px; text-align: center; }
    .btn-container { text-align: center; margin: 35px 0; }
    .button { background-color: #f97316; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3); }
    .footer { text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="title">Esqueceu sua senha?</div>
      <p class="text">Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Análises UNINASSAU</strong>.</p>
      <p class="text">Clique no botão abaixo para escolher uma nova senha:</p>
      <div class="btn-container">
        <a href="{{link}}" class="button">Redefinir Senha</a>
      </div>
      <p class="text" style="font-size: 13px;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>{{link}}</p>
    </div>
    <div class="footer">
      © 2026 UNINASSAU - Análises UNINASSAU<br>
      Se você não solicitou isso, ignore este e-mail.
    </div>
  </div>
</body>
</html>
```

---

## 3. Convite para Novo Usuário
**Assunto:** `Você foi convidado para o Análises UNINASSAU`

### 📝 Template HTML:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* ... mesmos estilos base ... */
    .button { background-color: #003366; color: white !important; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="title">Bem-vindo ao Time!</div>
      <p class="text">Olá!</p>
      <p class="text">Você acaba de ser convidado por <strong>EDGAR</strong> para acessar o painel de inteligência <strong>Análises UNINASSAU</strong>.</p>
      <p class="text">Clique no botão abaixo para ativar sua conta e começar:</p>
      <div class="btn-container">
        <a href="{{link}}" class="button">Aceitar Convite</a>
      </div>
    </div>
  </div>
</body>
</html>
```
