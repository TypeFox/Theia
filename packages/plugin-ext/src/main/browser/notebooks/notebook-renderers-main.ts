
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
// *****************************************************************************

import { DisposableCollection } from '@theia/core';
import { MAIN_RPC_CONTEXT, NotebookRenderersExt, NotebookRenderersMain } from '../../../common';
import { RPCProtocol } from '../../../common/rpc-protocol';

export class NotebookRenderersMainImpl implements NotebookRenderersMain {
    private readonly proxy: NotebookRenderersExt;

    private readonly disposables = new DisposableCollection();

    constructor(
        rpc: RPCProtocol,
    ) {
        this.proxy = rpc.getProxy(MAIN_RPC_CONTEXT.NOTEBOOK_RENDERERS_EXT);
        //     this._register(messaging.onShouldPostMessage(e => {
        //         this.proxy.$postRendererMessage(e.editorId, e.rendererId, e.message);
        //     }));
    }

    $postMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    dispose(): void {
        this.disposables.dispose();
    }
}
