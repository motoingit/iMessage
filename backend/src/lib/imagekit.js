import ImageKit, { toFile } from "@imagekit/nodejs";

function hasImageKitConfig(){
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

//MY photo (1).png
//chat-12300034-Myphoto_!.png
//this helper make safe unique falilename for upload
function createFileName(originalName = "upload"){
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
}


async function uploadChatMedia(file) {
  const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });

  const fileName = createFileName(file.originalname);

  const result = await imagekit.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "/chat",
  });

  return result.url;
}

async function uploadGenericMedia(file, folder = "/general") {
  const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });

  const fileName = createFileName(file.originalname);

  const result = await imagekit.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder,
  });

  return {
    url: result.url,
    fileId: result.fileId,
  };
}

async function deleteImageKitMedia(fileId) {
  const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });

  await imagekit.files.delete(fileId);
}

export { uploadChatMedia, uploadGenericMedia, deleteImageKitMedia, hasImageKitConfig };
