import axios from 'axios';

const CLERK_SECRET_KEY = 'sk_test_oHsBahXa1udzogNP2ejhL7l5IDokZQqB1sucV40lPv';

const templates = [
    {
        slug: 'verification_code',
        name: 'Verification code',
        subject: '{{otp_code}} é o seu código de verificação para Olinda InsightFlow',
        body: `<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; }
    .card { background-color: #ffffff; padding: 40px; border-radius: 12px; border-top: 6px solid #003366; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
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
      <p class="text">Para concluir seu login ou cadastro no <strong>Olinda InsightFlow</strong>, utilize o código de segurança abaixo:</p>
      <div class="code-container">
        <h1 class="code">{{otp_code}}</h1>
      </div>
      <p class="text">Este código expira em breve. Se você não solicitou este acesso, pode ignorar este e-mail com segurança.</p>
    </div>
    <div class="footer">
      © 2026 UNINASSAU - Olinda InsightFlow<br>
      Sistema de Inteligência e Captação
    </div>
  </div>
</body>
</html>`
    },
    {
        slug: 'invitation',
        name: 'Invitation',
        subject: 'Você foi convidado para o Olinda InsightFlow',
        body: `<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7fa; }
    .card { background-color: #ffffff; padding: 40px; border-radius: 12px; border-top: 6px solid #003366; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .title { color: #003366; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; }
    .text { color: #4a5568; line-height: 1.6; font-size: 16px; text-align: center; }
    .btn-container { text-align: center; margin: 35px 0; }
    .button { background-color: #003366; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
    .footer { text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="title">Bem-vindo ao Time!</div>
      <p class="text">Olá!</p>
      <p class="text">Você acaba de ser convidado para acessar o painel de inteligência <strong>Olinda InsightFlow</strong>.</p>
      <p class="text">Clique no botão abaixo para ativar sua conta e começar:</p>
      <div class="btn-container">
        <a href="{{action_url}}" class="button">Aceitar Convite</a>
      </div>
    </div>
    <div class="footer">
      © 2026 UNINASSAU - Olinda InsightFlow
    </div>
  </div>
</body>
</html>`
    }
];

async function updateTemplates() {
    console.log('🚀 Iniciando atualização de templates no Clerk...');

    for (const template of templates) {
        try {
            console.log(`\n📦 Atualizando: ${template.name} (${template.slug})...`);

            const response = await axios.put(
                `https://api.clerk.com/v1/templates/email/${template.slug}`,
                {
                    name: template.name,
                    subject: template.subject,
                    body: template.body,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ ${template.name} atualizado com sucesso!`);
        } catch (error) {
            console.error(`❌ Erro em ${template.name}:`, JSON.stringify(error.response?.data, null, 2) || error.message);
        }
    }
}

updateTemplates();
