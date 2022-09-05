import React from "react";
import styles from "@styles/components/KeyValueTable.module.css";

export interface KeyValueTableProp {
  data: {
    [key: string]: any;
  };
}

/**
 * File info table.
 */
export function KeyValueTable(prop: KeyValueTableProp) {
  const entries = Object.entries(prop.data);
  return (
    <>
      <table className={styles.table}>
        <tbody>
          {entries.map(([key, value]) => (
            <tr className={styles.row} key={key}>
              <td className={styles.colKey}>{key}</td>
              <td className={styles.colValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
