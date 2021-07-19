/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import React from 'react'

export default function Code(props) {
  const header    = (props && props.header) || null,
        block     = (props && props.block) || null;
  
  return(
    <>
      {(block)
        ? <div className="code">
            <div className="code_header">
              <div>{header}</div>
            </div>
            <pre className="code_block">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        : null
      }
    </>
  );
}
