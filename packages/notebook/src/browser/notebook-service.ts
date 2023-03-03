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

import { Disposable, DisposableCollection, Emitter } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { BinaryBuffer } from '@theia/core/lib/common/buffer';
import { NotebookData, NotebookExtensionDescription, TransientOptions } from '../common';

export interface SimpleNotebookProviderInfo {
    readonly viewType: string,
    readonly serializer: NotebookSerializer,
    readonly extensionData: NotebookExtensionDescription
}

export interface NotebookSerializer {
    options: TransientOptions;
    dataToNotebook(data: BinaryBuffer): Promise<NotebookData>;
    notebookToData(data: NotebookData): Promise<BinaryBuffer>;
}

@injectable()
export class NotebookService implements Disposable {

    private readonly disposables = new DisposableCollection();

    private readonly notebookProviders = new Map<string, SimpleNotebookProviderInfo>();

    private readonly addViewTypeEmitter = new Emitter<string>();
    readonly onAddViewType = this.addViewTypeEmitter.event;

    private readonly willRemoveViewTypeEmitter = new Emitter<string>();
    readonly onWillRemoveViewType = this.willRemoveViewTypeEmitter.event;

    constructor() { }

    dispose(): void {
        this.disposables.dispose();
    }

    registerNotebookSerializer(viewType: string, extensionData: NotebookExtensionDescription, serializer: NotebookSerializer): Disposable {
        if (this.notebookProviders.has(viewType)) {
            throw new Error(`notebook provider for viewtype '${viewType}' already exists`);
        }

        this.notebookProviders.set(viewType, { viewType, serializer, extensionData });
        this.addViewTypeEmitter.fire(viewType);

        return Disposable.create(() => {
            this.notebookProviders.delete(viewType);
            this.willRemoveViewTypeEmitter.fire(viewType);
        });
    }

    async canResolve(viewType: string): Promise<boolean> {
        // if (this.notebookProviders.has(viewType)) {
        //     return true;
        // }

        // await this._extensionService.whenInstalledExtensionsRegistered();
        // await this._extensionService.activateByEvent(`onNotebookSerializer:${viewType}`);

        return this.notebookProviders.has(viewType);
    }

    async withNotebookDataProvider(viewType: string): Promise<SimpleNotebookProviderInfo> {
        // const selected = this.notebookProviderInfoStore.get(viewType);
        // if (!selected) {
        //     throw new Error(`UNKNOWN notebook type '${viewType}'`);
        // }
        await this.canResolve(viewType);
        const result = this.notebookProviders.get(viewType);
        if (!result) {
            throw new Error(`NO provider registered for view type: '${viewType}'`);
        }
        return result;
    }
}
