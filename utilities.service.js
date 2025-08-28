async function downloadImage(url){
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch the image.`);
    }
    const mimeType = response.headers.get("Content-Type");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = buffer.toString("base64");
    return { data, mimeType };
}

module.exports = { downloadImage };