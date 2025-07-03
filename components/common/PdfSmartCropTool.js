import React, { useRef, useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';

export default function PdfSmartCropTool() {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startY, setStartY] = useState();
  const [endY, setEndY] = useState();
  const [isSelecting, setIsSelecting] = useState(false);
  const [viewport, setViewport] = useState(null);
  const [croppedImages, setCroppedImages] = useState([]);
  const [scale, setScale] = useState(3);

  // Configure the worker only once
  useEffect(() => {
    // Make sure we use the exact same version for both API and worker
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const doc = await pdfjs.getDocument({ data: typedarray }).promise;
      setPdfDoc(doc);
      setCurrentPage(1);
      renderPage(doc, 1);
    };
    reader.readAsArrayBuffer(file);
  };

  const renderPage = async (doc, pageNum) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const page = await doc.getPage(pageNum);
    const vp = page.getViewport({ scale });
    setViewport(vp);
    canvas.width = vp.width;
    canvas.height = vp.height;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
  };

  const redrawSelection = async () => {
    if (pdfDoc) {
      await renderPage(pdfDoc, currentPage);
      if (startY !== undefined && endY !== undefined) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const y = Math.min(startY, endY);
        const height = Math.abs(endY - startY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, y, canvas.width, height);
      }
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setStartY(e.clientY - rect.top);
    setIsSelecting(true);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setEndY(e.clientY - rect.top);
    redrawSelection();
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const applySharpen = (ctx, width, height) => {
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = 3, half = Math.floor(side / 2);
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - half;
            const scx = x + cx - half;
            if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
              const srcOff = (scy * width + scx) * 4;
              const wt = weights[cy * side + cx];
              r += src.data[srcOff] * wt;
              g += src.data[srcOff + 1] * wt;
              b += src.data[srcOff + 2] * wt;
            }
          }
        }
        const dstOff = (y * width + x) * 4;
        dst.data[dstOff] = Math.min(255, Math.max(0, r));
        dst.data[dstOff + 1] = Math.min(255, Math.max(0, g));
        dst.data[dstOff + 2] = Math.min(255, Math.max(0, b));
        dst.data[dstOff + 3] = 255;
      }
    }
    ctx.putImageData(dst, 0, 0);
  };

  const handleCrop = async () => {
    if (startY === undefined || endY === undefined || !pdfDoc || !viewport) return;
    const cropY = Math.min(startY, endY);
    const cropHeight = Math.abs(endY - startY);
    const page = await pdfDoc.getPage(currentPage);
    const highScale = 4.0;
    const highVp = page.getViewport({ scale: highScale });
    const yRatio = cropY / canvasRef.current.height;
    const hRatio = cropHeight / canvasRef.current.height;
    const highCropY = highVp.height * yRatio;
    const highCropHeight = highVp.height * hRatio;
    const highCropWidth = highVp.width;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = highCropWidth;
    cropCanvas.height = highCropHeight;
    const cropCtx = cropCanvas.getContext('2d');

    await page.render({
      canvasContext: cropCtx,
      viewport: highVp,
      transform: [1, 0, 0, 1, 0, -highCropY],
      height: highCropHeight,
      width: highCropWidth
    }).promise;

    const imageData = cropCtx.getImageData(0, 0, highCropWidth, highCropHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      let gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      gray = (gray - 128) * 1.4 + 128;
      gray = Math.max(0, Math.min(255, gray));
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    cropCtx.putImageData(imageData, 0, 0);
    applySharpen(cropCtx, highCropWidth, highCropHeight);
    setCroppedImages(prev => [...prev, cropCanvas.toDataURL('image/png')]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 PDF Smart Crop Tool (React)</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} /><br /><br />
      <label>Page:</label>
      <input
        type="number"
        min="1"
        value={currentPage}
        onChange={e => setCurrentPage(parseInt(e.target.value))}
        style={{ width: 50 }}
      />
      <label style={{ marginLeft: 10 }}>Quality:</label>
      <select value={scale} onChange={e => setScale(Number(e.target.value))}>
        <option value={1}>Low</option>
        <option value={2}>Medium</option>
        <option value={3}>High</option>
      </select>
      <button onClick={() => renderPage(pdfDoc, currentPage)}>Load Page</button>
      <br /><br />
      <button onClick={handleCrop}>Smart Crop (HQ)</button>
      <button onClick={() => { setStartY(undefined); setEndY(undefined); redrawSelection(); }}>Clear</button>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid #aaa', marginTop: 10 }}
      />

      <h3>🖼️ Cropped Images</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {croppedImages.map((src, i) => (
          <div key={i} style={{ border: '1px solid #ddd', padding: 5 }}>
            <img src={src} alt={`crop-${i}`} style={{ maxWidth: 300 }} />
            <a href={src} download={`crop-${i}.png`}>
              <button>Download</button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
