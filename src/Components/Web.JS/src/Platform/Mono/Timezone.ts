export async function loadTimezone() : Promise<void> {
    const timeZoneArea = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0];

    const [meta, data] = await Promise.all([fetch(`${timeZoneArea}.meta.js`).then(f => f.json()), fetch(`${timeZoneArea}.data`).then(f => f.arrayBuffer())]);
    const offsetData: OffsetData[] = meta;
    let arrayBuffer: ArrayBuffer = data;

    Module['FS_createPath']('/', 'zoneinfo', true, true);
    Module['FS_createPath']('/zoneinfo', timeZoneArea, true, true);

    for (const [fileName, length] of offsetData) {
        const slashIndex = fileName.indexOf('/');
        if (slashIndex != -1) {
            const subFolder = fileName.substring(slashIndex + 1);
            Module['FS_createPath'](`/zoneinfo/${timeZoneArea}`, subFolder, true, true);
        }

        const bytes = Uint8Array.from(new Uint8Array(arrayBuffer.slice(0, length)));
        Module['FS_createDataFile'](`/zoneinfo/${timeZoneArea}/${fileName}`, null, bytes, true, true, true);

        arrayBuffer = arrayBuffer.slice(length);
    }
}

type OffsetData = [string, number];