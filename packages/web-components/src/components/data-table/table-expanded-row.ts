/**
 * Copyright IBM Corp. 2020, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { prefix } from '../../globals/settings';
import styles from './data-table.scss?lit';
import { carbonElement as customElement } from '../../globals/decorators/carbon-element';

import HostListener from '../../globals/decorators/host-listener';
import HostListenerMixin from '../../globals/mixins/host-listener';
import CDSTableRow from './table-row';
/**
 * Table row of collapsible details.
 *
 * @element cds-table-expanded-row
 */
@customElement(`${prefix}-table-expanded-row`)
class CDSTableExpandedRow extends HostListenerMixin(LitElement) {
  /**
   * Handles `mouseover`/`mouseout` event handler on this element.
   *
   * @param event The event.
   */
  @HostListener('mouseover')
  @HostListener('mouseout')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleMouseOverOut(event: MouseEvent) {
    const { selectorRow } = this.constructor as typeof CDSTableExpandedRow;
    const { previousElementSibling } = this;
    if (previousElementSibling?.matches(selectorRow)) {
      (previousElementSibling as CDSTableRow).highlighted =
        event.type === 'mouseover';
    }
  }

  /**
   * The colspan.
   */
  @property({ type: Number, attribute: 'colspan' })
  colSpan = 1;

  /**
   * `true` if the table row should be expanded.
   */
  @property({ type: Boolean, reflect: true })
  expanded = false;

  /**
   * `true` if the table row should be filtered.
   */
  @property({ type: Boolean, reflect: true })
  filtered = false;

  /**
   * `true` if the table row should be highlighted.
   */
  @property({ type: Boolean, reflect: true })
  highlighted = false;

  /**
   * `true` if the previous table row has been selected
   */
  @property({ type: Boolean, reflect: true })
  selected = false;

  render() {
    const { colSpan } = this;
    return html`
      <td colspan="${colSpan}">
        <div class="${prefix}--child-row-inner-container">
          <slot></slot>
        </div>
      </td>
    `;
  }

  updated() {
    this.previousElementSibling?.hasAttribute('ai-label')
      ? this.setAttribute('ai-label', '')
      : this.removeAttribute('ai-label');
  }

  /**
   * A selector that will return the previous sibling row.
   */
  static get selectorRow() {
    return `${prefix}-table-row`;
  }

  static styles = styles;
}

export default CDSTableExpandedRow;
