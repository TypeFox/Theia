// *****************************************************************************
// Copyright (C) 2023 TypeFox and others.
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
// *****************************************************************************

import { DisposableCollection } from '@theia/core';
import { URI, UriComponents } from '@theia/core/lib/common/uri';
import { ResourceMap } from '@theia/monaco-editor-core/esm/vs/base/common/map';
import { NotebookModelResolverService } from '@theia/notebook/lib/browser';
import { MAIN_RPC_CONTEXT, NotebookDataDto, NotebookDocumentsExt, NotebookDocumentsMain } from '../../../common';
import { RPCProtocol } from '../../../common/rpc-protocol';

export class MainThreadNotebookDocuments implements NotebookDocumentsMain {

    private readonly disposables = new DisposableCollection();

    private readonly proxy: NotebookDocumentsExt;
    private readonly documentEventListenersMapping = new ResourceMap<DisposableCollection>();

    constructor(
        rpc: RPCProtocol,
        private readonly notebookModelResolverService: NotebookModelResolverService,
        // private readonly notebookService: NotebookService
    ) {
        this.proxy = rpc.getProxy(MAIN_RPC_CONTEXT.NOTEBOOK_DOCUMENTS_EXT);

        // forward dirty and save events
        this.disposables.push(this.notebookModelResolverService.onDidChangeDirty(model => this.proxy.$acceptDirtyStateChanged(model.uri.toComponents(), model.isDirty())));
        this.disposables.push(this.notebookModelResolverService.onDidSaveNotebook(e => this.proxy.$acceptModelSaved(e)));

    }

    dispose(): void {
        this.disposables.dispose();
        // this.modelReferenceCollection.dispose();
        this.documentEventListenersMapping.forEach(value => value.dispose());
    }

    // handleNotebooksAdded(notebooks: readonly NotebookTextModel[]): void {

    //     for (const textModel of notebooks) {
    //         const disposableStore = new DisposableCollection();
    //         disposableStore.push(textModel.onDidChangeContent(event => {

    //             const eventDto: NotebookCellsChangedEventDto = {
    //                 versionId: event.versionId,
    //                 rawEvents: []
    //             };

    //             for (const e of event.rawEvents) {

    //                 switch (e.kind) {
    //                     case NotebookCellsChangeType.ModelChange:
    //                         eventDto.rawEvents.push({
    //                             kind: e.kind,
    //                             changes: e.changes.map(diff => [diff[0], diff[1], diff[2].map(cell =>
    //                                         NotebookDto.toNotebookCellDto(cell))] as [number, number, NotebookCellDto[]])
    //                         });
    //                         break;
    //                     case NotebookCellsChangeType.Move:
    //                         eventDto.rawEvents.push({
    //                             kind: e.kind,
    //                             index: e.index,
    //                             length: e.length,
    //                             newIdx: e.newIdx,
    //                         });
    //                         break;
    //                     case NotebookCellsChangeType.Output:
    //                         eventDto.rawEvents.push({
    //                             kind: e.kind,
    //                             index: e.index,
    //                             outputs: e.outputs.map(NotebookDto.toNotebookOutputDto)
    //                         });
    //                         break;
    //                     case NotebookCellsChangeType.OutputItem:
    //                         eventDto.rawEvents.push({
    //                             kind: e.kind,
    //                             index: e.index,
    //                             outputId: e.outputId,
    //                             outputItems: e.outputItems.map(NotebookDto.toNotebookOutputItemDto),
    //                             append: e.append
    //                         });
    //                         break;
    //                     case NotebookCellsChangeType.ChangeCellLanguage:
    //                     case NotebookCellsChangeType.ChangeCellContent:
    //                     case NotebookCellsChangeType.ChangeCellMetadata:
    //                     case NotebookCellsChangeType.ChangeCellInternalMetadata:
    //                         eventDto.rawEvents.push(e);
    //                         break;
    //                 }
    //             }

    //             const hasDocumentMetadataChangeEvent = event.rawEvents.find(e => e.kind === NotebookCellsChangeType.ChangeDocumentMetadata);

    //             // using the model resolver service to know if the model is dirty or not.
    //             // assuming this is the first listener it can mean that at first the model
    //             // is marked as dirty and that another event is fired
    //             this.proxy.$acceptModelChanged(
    //                 textModel.uri,
    //                 eventDto,
    //                 this.notebookEditorModelResolverService.isDirty(textModel.uri),
    //                 hasDocumentMetadataChangeEvent ? textModel.metadata : undefined
    //             );
    //         }));

    //         this.documentEventListenersMapping.set(textModel.uri, disposableStore);
    //     }
    // }

    // handleNotebooksRemoved(uris: URI[]): void {
    //     for (const uri of uris) {
    //         this.documentEventListenersMapping.get(uri)?.dispose();
    //         this.documentEventListenersMapping.delete(uri);
    //     }
    // }

    async $tryCreateNotebook(options: { viewType: string; content?: NotebookDataDto }): Promise<UriComponents> {
        const ref = await this.notebookModelResolverService.resolve({ untitledResource: undefined }, options.viewType);

        // // untitled notebooks are disposed when they get saved. we should not hold a reference
        // // to such a disposed notebook and therefore dispose the reference as well
        // ref.onWillDispose(() => {
        //     ref.dispose();
        // });

        // untitled notebooks are dirty by default
        this.proxy.$acceptDirtyStateChanged(ref.uri.toComponents(), true);

        // apply content changes... slightly HACKY -> this triggers a change event
        // if (options.content) {
        //     const data = NotebookDto.fromNotebookDataDto(options.content);
        //     ref.notebook.reset(data.cells, data.metadata, ref.object.notebook.transientOptions);
        // }
        return ref.uri.toComponents();
    }

    async $tryOpenNotebook(uriComponents: UriComponents): Promise<UriComponents> {
        const uri = URI.fromComponents(uriComponents);
        // const ref = await this.notebookModelResolverService.resolve(uri);
        // this.modelReferenceCollection.add(uri, ref);
        return uri.toComponents();
    }

    async $trySaveNotebook(uriComponents: UriComponents): Promise<boolean> {
        const uri = URI.fromComponents(uriComponents);

        const ref = await this.notebookModelResolverService.resolve(uri);
        await ref.save({});
        ref.dispose();
        return true;
    }
}
