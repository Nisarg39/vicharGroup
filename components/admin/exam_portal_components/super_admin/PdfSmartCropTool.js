import { useEffect, useRef } from 'react';

export default function PdfSmartCropTool() {
  const pdfInputRef = useRef(null);
  const pageNumberInputRef = useRef(null);
  const qualitySelectRef = useRef(null);
  const loadPageBtnRef = useRef(null);
  const cropBtnRef = useRef(null);
  const clearBtnRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const croppedContainerRef = useRef(null);

  useEffect(() => {
    // Load PDF.js script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializePdfTool();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePdfTool = () => {
    const pdfInput = pdfInputRef.current;
    const pageNumberInput = pageNumberInputRef.current;
    const qualitySelect = qualitySelectRef.current;
    const loadPageBtn = loadPageBtnRef.current;
    const cropBtn = cropBtnRef.current;
    const clearBtn = clearBtnRef.current;
    const pdfCanvas = pdfCanvasRef.current;
    const ctx = pdfCanvas.getContext('2d');
    const croppedContainer = croppedContainerRef.current;
    
    let pdfDoc = null;
    let currentPage = 1;
    let pageViewport;
    let startY, endY;
    let isSelecting = false;
    
    pdfInput.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
        pageNumberInput.max = pdfDoc.numPages;
        currentPage = 1;
        await renderPage(currentPage);
      };
      reader.readAsArrayBuffer(file);
    });
    
    loadPageBtn.addEventListener('click', async () => {
      currentPage = parseInt(pageNumberInput.value);
      if (!pdfDoc || currentPage < 1 || currentPage > pdfDoc.numPages) return;
      await renderPage(currentPage);
    });
    
    async function renderPage(pageNum) {
      const page = await pdfDoc.getPage(pageNum);
      const scale = parseFloat(qualitySelect.value);
      pageViewport = page.getViewport({ scale });
      pdfCanvas.width = pageViewport.width;
      pdfCanvas.height = pageViewport.height;
      await page.render({ canvasContext: ctx, viewport: pageViewport }).promise;
    }
    
    function redrawPageWithSelection() {
      renderPage(currentPage).then(() => {
        if (startY !== undefined && endY !== undefined) {
          const y = Math.min(startY, endY);
          const height = Math.abs(endY - startY);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.strokeRect(0, y, pdfCanvas.width, height);
        }
      });
    }
    
    pdfCanvas.addEventListener('mousedown', e => {
      const rect = pdfCanvas.getBoundingClientRect();
      startY = e.clientY - rect.top;
      isSelecting = true;
    });
    
    pdfCanvas.addEventListener('mousemove', e => {
      if (!isSelecting) return;
      const rect = pdfCanvas.getBoundingClientRect();
      endY = e.clientY - rect.top;
      redrawPageWithSelection();
    });
    
    pdfCanvas.addEventListener('mouseup', () => {
      isSelecting = false;
    });
    
    cropBtn.addEventListener('click', async () => {
      if (startY === undefined || endY === undefined || !pdfDoc) return;
      const cropY = Math.min(startY, endY);
      const cropHeight = Math.abs(endY - startY);
      const cropWidth = pdfCanvas.width;
      const highScale = 4.0;
      const page = await pdfDoc.getPage(currentPage);
      const highViewport = page.getViewport({ scale: highScale });
      const yRatio = cropY / pdfCanvas.height;
      const hRatio = cropHeight / pdfCanvas.height;
      const highCropY = highViewport.height * yRatio;
      const highCropHeight = highViewport.height * hRatio;
      const highCropWidth = highViewport.width;
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = highCropWidth;
      croppedCanvas.height = highCropHeight;
      const croppedCtx = croppedCanvas.getContext('2d');
      await page.render({
        canvasContext: croppedCtx,
        viewport: highViewport,
        transform: [1, 0, 0, 1, 0, -highCropY],
        height: highCropHeight,
        width: highCropWidth
      }).promise;
      const imageData = croppedCtx.getImageData(0, 0, highCropWidth, highCropHeight);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        let gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        gray = (gray - 128) * 1.4 + 128;
        gray = Math.max(0, Math.min(255, gray));
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      croppedCtx.putImageData(imageData, 0, 0);
      applySharpen(croppedCtx, highCropWidth, highCropHeight);
      const cropBox = document.createElement('div');
      cropBox.className = 'crop-box';
      cropBox.appendChild(croppedCanvas);
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download';
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `smart_crop_page${currentPage}.png`;
        link.href = croppedCanvas.toDataURL('image/png');
        link.click();
      };
      cropBox.appendChild(downloadBtn);
      croppedContainer.appendChild(cropBox);
    });
    
    clearBtn.addEventListener('click', () => {
      startY = endY = undefined;
      redrawPageWithSelection();
    });
    
    function applySharpen(ctx, width, height) {
      const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      const side = 3;
      const half = Math.floor(side / 2);
      const src = ctx.getImageData(0, 0, width, height);
      const dst = ctx.createImageData(width, height);
      const sw = width, sh = height, srcData = src.data, dstData = dst.data;
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          let r = 0, g = 0, b = 0;
          for (let cy = 0; cy < side; cy++) {
            for (let cx = 0; cx < side; cx++) {
              const scy = y + cy - half, scx = x + cx - half;
              if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                const srcOff = (scy * sw + scx) * 4;
                const wt = weights[cy * side + cx];
                r += srcData[srcOff] * wt;
                g += srcData[srcOff + 1] * wt;
                b += srcData[srcOff + 2] * wt;
              }
            }
          }
          const dstOff = (y * sw + x) * 4;
          dstData[dstOff] = Math.min(255, Math.max(0, r));
          dstData[dstOff + 1] = Math.min(255, Math.max(0, g));
          dstData[dstOff + 2] = Math.min(255, Math.max(0, b));
          dstData[dstOff + 3] = 255;
        }
      }
      ctx.putImageData(dst, 0, 0);
    }
  };

  return (
    <div className="pdf-smart-crop">
      <h2>📄 PDF Smart Crop Tool (High Quality)</h2>
      
      <input type="file" id="pdfInput" accept="application/pdf" ref={pdfInputRef} /><br /><br />
      
      <label htmlFor="pageNumber">Page Number:</label>
      <input 
        type="number" 
        id="pageNumber" 
        min="1" 
        defaultValue="1" 
        style={{width: '60px'}} 
        ref={pageNumberInputRef}
      />
      
      <label htmlFor="qualitySelect">Preview Quality:</label>
      <select id="qualitySelect" defaultValue="3" ref={qualitySelectRef}>
        <option value="1">Low</option>
        <option value="2">Medium</option>
        <option value="3">High</option>
      </select>
      
      <button id="loadPageBtn" ref={loadPageBtnRef}>Load Page</button>
      
      <div id="controls">
        <button id="cropBtn" ref={cropBtnRef}>Smart Crop (HQ)</button>
        <button id="clearSelectionBtn" ref={clearBtnRef}>Clear Selection</button>
      </div>
      
      <canvas id="pdfCanvas" ref={pdfCanvasRef}></canvas>
      
      <h3>🖼️ Cropped Images</h3>
      <div className="cropped-container" id="croppedContainer" ref={croppedContainerRef}></div>
      
      <style jsx>{`
        .pdf-smart-crop {
          font-family: sans-serif;
          margin: 20px;
          max-width: 1000px;
        }
        canvas {
          border: 1px solid #aaa;
          margin-top: 10px;
          cursor: crosshair;
        }
        .cropped-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        .crop-box {
          border: 1px solid #ddd;
          padding: 5px;
          text-align: center;
        }
        #controls {
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
}