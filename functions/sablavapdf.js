import pdfkit from 'pdfkit';

export default function generatepdf() {
  const mmToPoint = mm => Math.round(72 * mm / 25.4);
  let buffers = [];
  let pdf = new pdfkit({ size: 'B7', layout: 'landscape', margin: mmToPoint(1), autoFirstPage: false });
  pdf.on('data', buffers.push.bind(buffers));
  pdf.font('Helvetica-Bold');
  pdf.image('logo.png', mmToPoint(10), mmToPoint(15), { width: mmToPoint(105) });
  pdf.fontSize(102);
  pdf.text(id.ID, mmToPoint(10), mmToPoint(50), { lineBreak: false });
  // small year
  pdf.fontSize(24);
  pdf.text('2022', mmToPoint(96), mmToPoint(40), { lineBreak: false });
  pdf.image(qr, mmToPoint(90), mmToPoint(52), { width: mmToPoint(26) });
  pdf.end();
  return Buffer.concat(buffers);
}
