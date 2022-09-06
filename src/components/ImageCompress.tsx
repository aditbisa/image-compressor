import imageCompression from 'browser-image-compression';
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { FileInfo } from '@components/FileInfo';
import { KeyValueTable } from '@components/KeyValueTable';
import styles from '@styles/components/ImageCompress.module.css';

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
  const anchorElm = useRef<HTMLAnchorElement>(null);

  /**
   * Prepare the download link.
   */
  const prepareLink = (result?: File) => {
    if (result) {
      anchorElm.current.href = URL.createObjectURL(result);
      anchorElm.current.download = '[compressed] ' + result.name;
    } else {
      anchorElm.current.href = undefined;
      anchorElm.current.download = undefined;
    }
  };

  /**
   * The work is an effect, only if the file changed.
   */
  useEffect(() => {
    if (!(prop.file instanceof File)) return;
    setProcessing(true);
    setResult(null);
    prepareLink();

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
        prepareLink(compressedFile);
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
          <a
            className={styles.button + (result ? ' ' + styles.ready : '')}
            ref={anchorElm}
          >
            💾
          </a>
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
