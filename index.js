require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fs = require("fs");
const https = require("https");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =====================================================
// CHANNELS
// =====================================================

const PROFILE_CHANNELS = [
  "1510378733024968754", // boy
  "1510378797059276830"  // girl
];
const MATCHING_CHANNEL_ID = "1510378851853668453";

// =====================================================
// SEPARADOR
// =====================================================

const SEPARATOR_URL =
"https://cdn.discordapp.com/attachments/1498155167076323389/1510397709260034118/IMG_20260530_154102.png?ex=6a1caafb&is=6a1b597b&hm=57f0c2bbfba5d5309b06e489055c6acbdf263235881fe8ff5267b516c8b87267&";

// =====================================================

const cache = new Map();
console.log("🟡 Galaxy Bot iniciando...");
function download(url, path) {

  return new Promise((resolve, reject) => {

    const file = fs.createWriteStream(path);

    https.get(url, (res) => {

      res.pipe(file);

      file.on("finish", () => {

        file.close();
        resolve();

      });

    }).on("error", (err) => {

      fs.unlink(path, () => {});
      reject(err);

    });

  });

}
// =====================================================
// READY
// =====================================================

client.once("ready", () => {

  console.log(`🟢 Conectado como ${client.user.tag}`);

});

// =====================================================
// ROUND RECT
// =====================================================

function roundRect(ctx, x, y, w, h, r) {

  ctx.beginPath();

  ctx.moveTo(x + r, y);

  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);

  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);

  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);

  ctx.closePath();

}

// =====================================================
// COLOR PROMEDIO
// =====================================================

function getAverageColor(img) {

  const c = createCanvas(50, 50);
  const ctx = c.getContext("2d");

  ctx.drawImage(img, 0, 0, 50, 50);

  const data = ctx.getImageData(0, 0, 50, 50).data;

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {

    r += data[i];
    g += data[i + 1];
    b += data[i + 2];

    count++;

  }

  return {
    r: Math.floor(r / count),
    g: Math.floor(g / count),
    b: Math.floor(b / count)
  };

}

// =====================================================
// VALIDAR IMÁGENES
// =====================================================

function validImage(att) {

  const url = att.url.toLowerCase().split("?")[0];

  return (
    url.endsWith(".png") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".webp")
  );

}

// =====================================================
// MESSAGE
// =====================================================

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  const attachments = [...message.attachments.values()];

  if (attachments.length === 0) return;

  if (!attachments.every(validImage)) {
    return message.reply(
      "Solo imágenes PNG/JPG/WEBP 😭"
    );
  }

  // =====================================================
  // 🔥 BOY PROFILE
  // =====================================================

  if (PROFILE_CHANNELS.includes(message.channel.id)) {

    if (attachments.length < 2) {
      return message.reply(
        "Envía:\n1 avatar\n1 banner"
      );
    }

    try {

      const avatar = attachments[0].url;
      const banner = attachments[1].url;

await download(avatar, "./avatar.png");
await download(banner, "./banner.png");

const avatarImg = await loadImage("./avatar.png");
const bannerImg = await loadImage("./banner.png");

      const avatarColor = getAverageColor(avatarImg);
      const bannerColor = getAverageColor(bannerImg);

      const neon1 =
        `rgb(${avatarColor.r},${avatarColor.g},${avatarColor.b})`;

      const neon2 =
        `rgb(${bannerColor.r},${bannerColor.g},${bannerColor.b})`;

      const canvas = createCanvas(900, 500);
      const ctx = canvas.getContext("2d");

      // fondo blur
      ctx.filter = "blur(12px)";
      ctx.drawImage(bannerImg, -20, -20, 940, 540);
      ctx.filter = "none";

      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, 900, 500);

      // banner
      roundRect(ctx, 110, 35, 770, 300, 35);

      ctx.save();
      ctx.clip();

      ctx.drawImage(bannerImg, 110, 35, 770, 300);

      ctx.restore();

      // glow banner
      ctx.strokeStyle = neon2;
      ctx.lineWidth = 4;
      ctx.shadowColor = neon2;
      ctx.shadowBlur = 18;

      roundRect(ctx, 110, 35, 770, 300, 35);
      ctx.stroke();

      // línea glow
      ctx.beginPath();

      ctx.moveTo(120, 340);
      ctx.lineTo(870, 340);

      ctx.strokeStyle = neon1;
      ctx.lineWidth = 7;
      ctx.shadowColor = neon1;
      ctx.shadowBlur = 35;

      ctx.stroke();

      // avatar
      ctx.save();

      ctx.beginPath();
      ctx.arc(200, 350, 115, 0, Math.PI * 2);

      ctx.clip();

      ctx.drawImage(avatarImg, 85, 235, 230, 230);

      ctx.restore();

      // glow avatar
      ctx.beginPath();
      ctx.arc(200, 350, 120, 0, Math.PI * 2);

      ctx.strokeStyle = neon1;
      ctx.lineWidth = 6;
      ctx.shadowColor = neon1;
      ctx.shadowBlur = 30;

      ctx.stroke();

      const attachment = new AttachmentBuilder(
        await canvas.encode("png"),
        { name: "boy-profile.png" }
      );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("originales")
          .setLabel("📥")
          .setStyle(ButtonStyle.Secondary)
      );

      const msg = await message.channel.send({
        content: `From: <@${message.author.id}>`,
        files: [attachment],
        components: [row]
      });

      cache.set(msg.id, {
        files: [avatar, banner],
        userId: message.author.id
      });

      // =====================================================
      // SEPARADOR
      // =====================================================

      setTimeout(async () => {

        try {

          const separatorImg = await loadImage(SEPARATOR_URL);

          const sepCanvas = createCanvas(900, 120);
          const sepCtx = sepCanvas.getContext("2d");

          sepCtx.drawImage(separatorImg, 0, 0, 900, 120);

          const sepAttachment = new AttachmentBuilder(
            sepCanvas.toBuffer("image/png"),
            { name: "separator.png" }
          );

          await message.channel.send({
            files: [sepAttachment]
          });

        } catch (err) {

          console.error("🔥 ERROR SEPARADOR:", err);

        }

      }, 1200);

    } catch (err) {

      console.error("🔥 ERROR BOY:", err);

    }

  }

// =====================================================
// 💘 MATCHING
// =====================================================

if (message.channel.id === MATCHING_CHANNEL_ID) {

  if (attachments.length < 3) {
    return message.reply(
      "Envía:\n1 avatar\n1 avatar\n1 banner"
    );
  }

  try {

    const avatar1 = attachments[0].url;
    const avatar2 = attachments[1].url;
    const banner = attachments[2].url;

    // =========================
    // DESCARGAR
    // =========================

    await download(avatar1, "./avatar1.png");
    await download(avatar2, "./avatar2.png");
    await download(banner, "./banner.png");

    const avatar1Img = await loadImage("./avatar1.png");
    const avatar2Img = await loadImage("./avatar2.png");
    const bannerImg = await loadImage("./banner.png");
    const color1 = getAverageColor(avatar1Img);
const color2 = getAverageColor(avatar2Img);
const color3 = getAverageColor(bannerImg);

const neon1 =
`rgb(${color1.r},${color1.g},${color1.b})`;

const neon2 =
`rgb(${color2.r},${color2.g},${color2.b})`;

const neon3 =
`rgb(${color3.r},${color3.g},${color3.b})`;

    // =========================
    // CANVAS
    // =========================

    const canvas = createCanvas(900, 500);
    const ctx = canvas.getContext("2d");

    // fondo blur
    ctx.filter = "blur(12px)";
    ctx.drawImage(bannerImg, -20, -20, 940, 540);
    ctx.filter = "none";

    ctx.fillStyle = "rgba(0,0,0,0.40)";
    ctx.fillRect(0, 0, 900, 500);

    // =========================
    // BANNER
    // =========================

    roundRect(ctx, 90, 35, 720, 240, 35);

    ctx.save();
    ctx.clip();

    ctx.drawImage(bannerImg, 90, 35, 720, 240);

    ctx.restore();

    // glow banner
    ctx.strokeStyle = neon3;
    ctx.lineWidth = 7;
    ctx.shadowColor = neon3;
    ctx.shadowBlur = 20;

    roundRect(ctx, 90, 35, 720, 240, 35);
    ctx.stroke();


    // =========================
    // AVATAR 1
    // =========================

    ctx.save();

    ctx.beginPath();
    ctx.arc(250, 320, 100, 0, Math.PI * 2);

    ctx.clip();

    ctx.drawImage(avatar1Img, 150, 220, 200, 200);

    ctx.restore();

    // borde avatar 1
    ctx.beginPath();
    ctx.arc(250, 320, 105, 0, Math.PI * 2);

    ctx.strokeStyle = neon1;
    ctx.lineWidth = 8;
    ctx.shadowColor = neon1;
    ctx.shadowBlur = 25;

    ctx.stroke();

    // =========================
    // AVATAR 2
    // =========================

    ctx.save();

    ctx.beginPath();
    ctx.arc(650, 320, 100, 0, Math.PI * 2);

    ctx.clip();

    ctx.drawImage(avatar2Img, 550, 220, 200, 200);

    ctx.restore();

    // borde avatar 2
    ctx.beginPath();
    ctx.arc(650, 320, 105, 0, Math.PI * 2);

    ctx.strokeStyle = neon2;
    ctx.lineWidth = 8;
    ctx.shadowColor = neon2;
    ctx.shadowBlur = 25;

    ctx.stroke();

    // =========================
    // EXPORTAR
    // =========================

    const attachment = new AttachmentBuilder(
      await canvas.encode("png"),
      { name: "matching.png" }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("originales")
        .setEmoji("📥")
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({
      content: `From: <@${message.author.id}>`,
      files: [attachment],
      components: [row]
    });

    cache.set(msg.id, {
      files: [avatar1, avatar2, banner],
      userId: message.author.id
    });

  } catch (err) {

    console.error("🔥 ERROR MATCHING:", err);

  }

}

});
// =====================================================
// BUTTON
// =====================================================

client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  if (interaction.customId !== "originales") return;

  const data = cache.get(interaction.message.id);

  if (!data) {

    return interaction.reply({
      content: "No encontrado",
      ephemeral: true
    });

  }

  await interaction.reply({
    files: data.files,
    ephemeral: true
  });

});

client.login(process.env.TOKEN);