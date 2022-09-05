import React, { ReactNode, useState } from "react";
import { FileInfo } from "@components/FileInfo";
import styles from "@styles/components/ImageFileInput.module.css";

export interface ImageFileInputProp {
  onFileChange: (file: File) => void;
}

/**
 * File selector only for images.
 */
export function ImageFileInput(prop: ImageFileInputProp) {
  const [file, setFile] = useState(null);

  /**
   * Handle input file change.
   */
  const handleSelectFile = (e: React.FormEvent<EventTarget>) => {
    const target = e.target as HTMLInputElement;
    if (!target.files[0]) return;

    const selectedFile = target.files[0];
    setFile(selectedFile);
    prop.onFileChange(selectedFile);
  };

  let info: ReactNode;
  if (file) {
    info = <FileInfo file={file} />;
  } else {
    info = <em>No image selected</em>;
  }

  return (
    <>
      <div className={styles.box}>
        <div className={styles.inputBox}>
          <label htmlFor="imageFileInput" className={styles.inputLabel}>
            📁
          </label>
          <input
            type="file"
            id="imageFileInput"
            className={styles.inputFile}
            onChange={handleSelectFile}
            accept="image/*"
          />
        </div>
        <div className={styles.infoBox}>{info}</div>
      </div>
    </>
  );
}
