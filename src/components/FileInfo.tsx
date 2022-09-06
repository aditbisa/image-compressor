import React from 'react';
import { KeyValueTable } from '@components/KeyValueTable';
import styles from '@styles/components/FileInfo.module.css';

export interface FileInfoProp {
  file: File;
}

/**
 * File info table.
 */
export function FileInfo(prop: FileInfoProp) {
  const file = prop.file;
  const fileSizeMb = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  const data = {
    Filename: file.name,
    Size: fileSizeMb,
    Type: file.type,
  };
  return <KeyValueTable data={data} />;
}
