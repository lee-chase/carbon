/**
 * Copyright IBM Corp. 2019, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { prefix } from '../../globals/settings';
import { carbonElement as customElement } from '../../globals/decorators/carbon-element';
import { NOTIFICATION_TYPE } from './defs';
import CDSInlineNotification from './inline-notification';
import styles from './toast-notification.scss?lit';

/**
 * Toast notification.
 *
 * @element cds-toast-notification
 * @slot subtitle - The subtitle.
 * @slot title - The title.
 * @fires cds-notification-beingclosed
 *   The custom event fired before this notification is being closed upon a user gesture.
 *   Cancellation of this event stops the user-initiated action of closing this notification.
 * @fires cds-notification-closed - The custom event fired after this notification is closed upon a user gesture.
 */
@customElement(`${prefix}-toast-notification`)
class CDSToastNotification extends CDSInlineNotification {
  protected _type = NOTIFICATION_TYPE.TOAST;

  protected _renderText() {
    const { caption, subtitle, title, _type: type } = this;
    return html`
      <div class="${prefix}--${type}-notification__details">
        <div class="${prefix}--${type}-notification__title">
          ${title}<slot name="title"></slot>
        </div>
        <div class="${prefix}--${type}-notification__subtitle">
          ${subtitle}<slot name="subtitle"></slot>
        </div>
        <div class="${prefix}--${type}-notification__caption">
          ${caption}<slot name="caption"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }

  /**
   * Specify the caption
   */
  @property()
  caption = '';

  render() {
    const { _type: type } = this;
    return html`
      ${this._renderIcon()}
      <div class="${prefix}--${type}-notification__details">
        ${this._renderText()}
      </div>
      ${this._renderButton()}
    `;
  }

  static styles = styles;
}

export default CDSToastNotification;
