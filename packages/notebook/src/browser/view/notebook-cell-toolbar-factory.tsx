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

import * as React from '@theia/core/shared/react';
import { CommandRegistry, CompoundMenuNodeRole, MenuModelRegistry } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { CellDto } from '../../common';
import { NotebookCellToolbar } from './notebook-cell-toolbar';
import { ContextMenuRenderer } from '@theia/core/lib/browser';
import { NotebookModel } from '../view-model/notebook-model';

export interface NotebookCellToolbarItem {
    icon?: string;
    label?: string;
    onClick: (e: React.MouseEvent) => void;
}

@injectable()
export class NotebookCellToolbarFactory {

    @inject(MenuModelRegistry)
    protected menuRegistry: MenuModelRegistry;

    @inject(ContextKeyService)
    protected contextKeyService: ContextKeyService;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    renderToolbar(notebookModel: NotebookModel, cell: CellDto): React.ReactNode {
        const inlineItems: NotebookCellToolbarItem[] = [];

        const toolbarMenuId = 'notbook-cell-acions-menu';

        for (const menuNode of this.menuRegistry.getMenu([toolbarMenuId]).children) {
            inlineItems.push({
                icon: menuNode.icon,
                label: menuNode.label,
                onClick: menuNode.role === CompoundMenuNodeRole.Submenu ?
                    e => this.openContextMenu(e, [toolbarMenuId, menuNode.id]) :
                    () => this.commandRegistry.executeCommand(menuNode.command!, cell)
            });
        }
        return <NotebookCellToolbar inlineItems={inlineItems} />;
    }

    private openContextMenu(e: React.MouseEvent, menuPath: string[]): void {
        this.contextMenuRenderer.render({ anchor: e.nativeEvent, menuPath: menuPath });
    }
}