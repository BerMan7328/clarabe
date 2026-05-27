# Configurar Google Sheets para receber RSVPs

Setup único, **gratuito**, sem servidor. Tempo: ~5 minutos.

## Passo 1 — Criar a planilha

1. Acesse https://sheets.google.com e crie uma nova planilha em branco.
2. Renomeie para algo como **"RSVPs Clara & Bê"**.
3. Na **primeira linha** (cabeçalho), coloque essas colunas exatamente:

```
Data/Hora | Nome | WhatsApp | Vai? | Quantas pessoas | Lado | Recado | Pulou a história?
```

## Passo 2 — Adicionar o Apps Script

1. Na planilha, vá em **Extensões → Apps Script**.
2. Apague o código padrão (`function myFunction() { ... }`) e cole o conteúdo abaixo:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.nome || '',
      data.whatsapp || '',
      data.vai || '',
      data.quantos || '',
      data.lado || '',
      data.recado || '',
      data.chato || 'Não'
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Salve (ícone de disquete ou `Ctrl+S`).
4. Renomeie o projeto para **"RSVP Bridge"**.

## Passo 3 — Publicar como Web App

1. Clique em **Implantar → Nova implantação** (Deploy → New deployment).
2. Em **Tipo**, escolha **Aplicativo da Web** (Web app).
3. Configurações:
   - **Descrição**: `RSVP Bridge v1`
   - **Executar como**: **Eu** (seu email)
   - **Quem pode acessar**: **Qualquer pessoa** (Anyone)
4. Clique **Implantar**.
5. Vai pedir autorização — clique **Autorizar acesso** → escolha sua conta → **Avançado → Acessar projeto sem verificação** → **Permitir**.
6. **COPIE a URL do Web app** (formato: `https://script.google.com/macros/s/AKfy.../exec`).

## Passo 4 — Colar a URL no convite

1. Abra `script.js` no editor.
2. Encontre a linha:

```javascript
const SHEETS_ENDPOINT = 'PLACEHOLDER_SHEETS_URL';
```

3. Substitua `'PLACEHOLDER_SHEETS_URL'` pela URL que copiou no passo 3:

```javascript
const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```

4. Faça commit e push:

```bash
git add script.js
git commit -m "Configure Sheets endpoint"
git push
```

Pronto. A partir de agora, cada submit do RSVP **aparece automaticamente na planilha**.

## Como testar

1. Abra o convite (modo anônimo / hard refresh).
2. Vai até a última ilha → confirma presença → preenche o formulário → envia.
3. Volte à planilha — em até **5 segundos** uma nova linha deve aparecer com:
   - Data/Hora do envio
   - Nome, "Vai?", "Lado" e "Recado"

## Se precisar atualizar o script

Sempre que **mudar o código** do Apps Script, é preciso re-implantar:
- **Implantar → Gerenciar implantações** → ícone de lápis na sua implantação ativa → **Versão: Nova versão** → **Implantar**.
- A URL **continua a mesma**, então não precisa atualizar o `script.js` novamente.

## Recursos extras (opcional)

- **Notificação por email**: dentro do `doPost`, adicione `MailApp.sendEmail('seu@email.com', 'Novo RSVP', JSON.stringify(data));`
- **Backup automático**: no menu Apps Script `Acionadores → Adicionar` para rodar uma função periódica.

## Fallback se Sheets falhar

Mesmo sem configurar, o convite ainda funciona:
- Cada confirmação é **salva no localStorage** do browser do convidado (backup local).
- Se a planilha não responder, aparece um botão verde **"Enviar pelo WhatsApp"** com a mensagem já pré-preenchida (o convidado envia com 1 clique).
