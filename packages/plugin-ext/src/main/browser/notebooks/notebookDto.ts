// *****************************************************************************
// Copyright (C) 2023 Red Hat, Inc. and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0

import * as notebookCommon from '@theia/notebook/lib/common';
import * as rpc from '../../../common';

export namespace NotebookDto {

    export function toNotebookOutputItemDto(item: notebookCommon.OutputItemDto): rpc.NotebookOutputItemDto {
        return {
            mime: item.mime,
            valueBytes: item.data
        };
    }

    export function toNotebookOutputDto(output: notebookCommon.OutputDto): rpc.NotebookOutputDto {
        return {
            metadata: output.metadata,
            items: output.outputs.map(toNotebookOutputItemDto)
        };
    }

    export function toNotebookCellDataDto(cell: notebookCommon.CellDto): rpc.NotebookCellDataDto {
        return {
            cellKind: cell.cellKind,
            language: cell.language,
            source: cell.source,
            internalMetadata: cell.internalMetadata,
            metadata: cell.metadata,
            outputs: cell.outputs.map(toNotebookOutputDto)
        };
    }

    export function toNotebookDataDto(data: notebookCommon.NotebookData): rpc.NotebookDataDto {
        return {
            metadata: data.metadata,
            cells: data.cells.map(toNotebookCellDataDto)
        };
    }

    export function fromNotebookOutputItemDto(item: rpc.NotebookOutputItemDto): notebookCommon.OutputItemDto {
        return {
            mime: item.mime,
            data: item.valueBytes
        };
    }

    export function fromNotebookOutputDto(output: rpc.NotebookOutputDto): notebookCommon.OutputDto {
        return {
            metadata: output.metadata,
            outputs: output.items.map(fromNotebookOutputItemDto)
        };
    }

    export function fromNotebookCellDataDto(cell: rpc.NotebookCellDataDto): notebookCommon.CellDto {
        return {
            cellKind: cell.cellKind,
            language: cell.language,
            source: cell.source,
            outputs: cell.outputs.map(fromNotebookOutputDto),
            metadata: cell.metadata,
            internalMetadata: cell.internalMetadata
        };
    }

    export function fromNotebookDataDto(data: rpc.NotebookDataDto): notebookCommon.NotebookData {
        return {
            metadata: data.metadata,
            cells: data.cells.map(fromNotebookCellDataDto)
        };
    }

    export function toNotebookCellDto(cell: notebookCommon.Cell): rpc.NotebookCellDto {
        return {
            handle: cell.handle,
            uri: cell.uri.toComponents(),
            source: cell.textBuffer.split('\n'),
            eol: '\n',
            language: cell.language,
            cellKind: cell.cellKind,
            outputs: cell.outputs.map(toNotebookOutputDto),
            metadata: cell.metadata,
            internalMetadata: cell.internalMetadata,
        };
    }

    // export function fromCellExecuteUpdateDto(data: extHostProtocol.ICellExecuteUpdateDto): ICellExecuteUpdate {
    //     if (data.editType === CellExecutionUpdateType.Output) {
    //         return {
    //             editType: data.editType,
    //             cellHandle: data.cellHandle,
    //             append: data.append,
    //             outputs: data.outputs.map(fromNotebookOutputDto)
    //         };
    //     } else if (data.editType === CellExecutionUpdateType.OutputItems) {
    //         return {
    //             editType: data.editType,
    //             append: data.append,
    //             outputId: data.outputId,
    //             items: data.items.map(fromNotebookOutputItemDto)
    //         };
    //     } else {
    //         return data;
    //     }
    // }

    // export function fromCellExecuteCompleteDto(data: extHostProtocol.ICellExecutionCompleteDto): ICellExecutionComplete {
    //     return data;
    // }

    // export function fromCellEditOperationDto(edit: extHostProtocol.ICellEditOperationDto): notebookCommon.ICellEditOperation {
    //     if (edit.editType === notebookCommon.CellEditType.Replace) {
    //         return {
    //             editType: edit.editType,
    //             index: edit.index,
    //             count: edit.count,
    //             cells: edit.cells.map(fromNotebookCellDataDto)
    //         };
    //     } else {
    //         return edit;
    //     }
    // }
}
