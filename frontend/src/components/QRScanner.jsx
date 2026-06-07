import { Html5Qrcode }
from "html5-qrcode";

import {
  useEffect,
  useRef
} from "react";

function QRScanner({ onScan }) {

  const scannerRef = useRef(null);

  const escaneado = useRef(false);

  useEffect(() => {

    const iniciarScanner = async () => {

      try {

        scannerRef.current =
          new Html5Qrcode("reader");

        await scannerRef.current.start(

          {
            facingMode:"environment"
          },

          {
            fps:20,

            qrbox:{
              width:260,
              height:260
            },

            aspectRatio:1,

            disableFlip:false
          },

          async (decodedText) => {

            if(escaneado.current)
              return;

            escaneado.current = true;

            console.log(
              "QR:",
              decodedText
            );

            // Vibración celular
            if(navigator.vibrate){

              navigator.vibrate(200);

            }

            // Sonido
            const audio =
              new Audio(
                "/scan.mp3"
              );

            audio.play();

            onScan(decodedText);

            // Espera para volver a escanear
            setTimeout(() => {

              escaneado.current = false;

            }, 3000);

          },

          () => {}

        );

      } catch(error){

        console.log(error);

      }

    };

    iniciarScanner();

    return () => {

      if(scannerRef.current){

        scannerRef.current
          .stop()
          .then(() => {

            scannerRef.current
              .clear();

          })
          .catch(() => {});

      }

    };

  }, []);

  return (
    <div id="reader"></div>
  );

}

export default QRScanner;