const printDiv = (selector) => {
  const printableArea = document.querySelector(selector);
  if (printableArea) {
    const printContents = printableArea.innerHTML;
    const printWindow = window.open("", "_blank", "height=600,width=800");

    printWindow.document.write("<html><head><title>Imprimir QR</title>");
    printWindow.document.write(
      "<style>" +
        "body {" +
        "  display: flex;" +
        "  justify-content: center;" +
        "  align-items: center;" +
        "  margin: 0;" +
        "  text-align: center;" +
        "}" +
        ".print-container {" +
        "  display: flex;" +
        "  flex-direction: column;" +
        "  align-items: center;" +
        "  width: 62mm;" + // Ajustamos el ancho de la etiqueta a 79mm
        "  height: auto;" +
        "  box-sizing: border-box;" +
        "}" +
        ".logo, .qr, .matricula {" +
        "  width: 100%;" + // Ajustamos el ancho al 100% del contenedor
        "  max-width: 62mm;" +
        "  height: auto;" +
        "}" +
        ".qr {" +
        "  z-index: 0 !important;" + // Ajustamos el z-index de qr
        "  margin-bottom: -1px !important;" + // Añadimos margen inferior negativo
        "}" +
        ".logo {" +
        "  z-index: 99 !important;" +
        "margin-bottom: 30px;" +
        "}" +
        ".matricula {" +
        "margin-top: -5px;" +
        "  z-index: 1 !important;" + // Cambiamos el z-index para que esté por encima del .qr
        "  padding: 0.5rem !important;" + // Reducimos el padding
        "  background-color: white !important;" +
        "  text-align: center !important;" +
        "}" +
        "@media print {" +
        "  @page {" +
        "    margin: 0;" +
        "    size: 79mm auto;" + // Ajustamos el tamaño de la página para que sea de 79mm de ancho
        "  }" +
        "  body {" +
        "    margin: 0;" +
        "  }" +
        "  header, footer, aside, nav, form {" +
        "    display: none;" +
        "  }" +
        "}" +
        ".botonImprimir {" +
        "  display: none;" +
        "}" +
        "</style>"
    );

    printWindow.document.write("</head><body>");
    printWindow.document.write('<div class="print-container">');
    printWindow.document.write(printContents);
    printWindow.document.write("</div></body></html>");
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = function () {
        printWindow.close(); // Cierra la ventana después de imprimir
      };
    };
  }
};

export default printDiv;
