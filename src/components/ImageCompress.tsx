import imageCompression from "browser-image-compression";
import React, { useState, useEffect, ReactNode } from "react";
import { FileInfo } from "@components/FileInfo";
import { KeyValueTable } from "@components/KeyValueTable";
import styles from "@styles/components/ImageCompress.module.css";

export interface ImageCompressProp {
  file: File;
  options: {
    maxSizeMB: number;
    maxWidthOrHeight: number;
  };
  onCompressionResult: (file: File) => void;
}

/**
 * Image compressor.
 */
export function ImageCompress(prop: ImageCompressProp) {
  const [result, setResult] = useState<File>();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * The work is an effect only if the file changed.
   */
  useEffect(() => {
    if (!(prop.file instanceof File)) return;
    setProcessing(true);
    setResult(null);

    const options = {
      ...prop.options,
      ...{
        useWebWorker: true,
        onProgress: (percent: number) => {
          setProgress(percent);
        },
        // TODO: AbortController for signal.
        // Stop the previous process when the user has no patience and change the file.
      },
    };

    // The work!
    imageCompression(prop.file, options)
      .then((compressedFile) => {
        setResult(compressedFile);
        prop.onCompressionResult(compressedFile);
      })
      .catch((error) => {
        console.error(error.message);
      })
      .finally(() => {
        setProcessing(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prop.file?.name, prop.file?.size]);

  /**
   * Handle download result.
   * Either use anchor (need styling) or saveAs library.
   */
  const downloadResult = () => {
    // TODO: download result.
  };

  let resultInfo: ReactNode;
  if (processing) {
    resultInfo = (
      <div>
        <em>Processing..</em>
      </div>
    );
  } else {
    if (prop.file && result) {
      resultInfo = <FileInfo file={result} />;
    } else {
      resultInfo = (
        <div>
          <em>No image selected</em>
        </div>
      );
    }
  }

  return (
    <>
      <div className={styles.box}>
        <div className={styles.downloadBox}>
          <label
            className={styles.button + (result ? " " + styles.ready : "")}
            onClick={downloadResult}
          >
            💾
          </label>
        </div>
        <div className={styles.progressBox}>
          <div>
            <div className={styles.caption}>Options:</div>
            <KeyValueTable data={prop.options} />
          </div>
          <div>
            <div className={styles.caption}>Result:</div>
            {resultInfo}
          </div>
          <progress className={styles.progress} max="100" value={progress} />
        </div>
      </div>
    </>
  );
}
