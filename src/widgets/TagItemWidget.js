/**
 * TagItemWidgets are used within a {@link OO.ui.TagMultiselectWidget
 * TagMultiselectWidget} to display the selected items.
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.mixin.ItemWidget
 * @mixins OO.ui.mixin.LabelElement
 * @mixins OO.ui.mixin.FlaggedElement
 * @mixins OO.ui.mixin.TabIndexedElement
 * @mixins OO.ui.mixin.DraggableElement
 *
 * @constructor
 * @param {Object} [config] Configuration object
 * @cfg {boolean} [valid=true] Item is valid
 * @cfg {boolean} [fixed] Item is fixed. This means the item is
 *  always included in the values and cannot be removed.
 */
OO.ui.TagItemWidget = function OoUiTagItemWidget( config ) {
	config = config || {};

	// Parent constructor
	OO.ui.TagItemWidget.parent.call( this, config );

	// Mixin constructors
	OO.ui.mixin.ItemWidget.call( this );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.FlaggedElement.call( this, config );
	OO.ui.mixin.TabIndexedElement.call( this, config );
	OO.ui.mixin.DraggableElement.call( this, config );

	this.valid = config.valid === undefined ? true : !!config.valid;
	this.fixed = !!config.fixed;

	this.closeButton = new OO.ui.ButtonWidget( {
		framed: false,
		icon: 'close',
		tabIndex: -1,
		title: OO.ui.msg( 'ooui-item-remove' )
	} );
	this.closeButton.setDisabled( this.isDisabled() );

	// Events
	this.closeButton
		.connect( this, { click: 'remove' } );
	this.$element
		.on( 'click', this.select.bind( this ) )
		.on( 'keydown', this.onKeyDown.bind( this ) )
		// Prevent propagation of mousedown; the tag item "lives" in the
		// clickable area of the TagMultiselectWidget, which listens to
		// mousedown to open the menu or popup. We want to prevent that
		// for clicks specifically on the tag itself, so the actions taken
		// are more deliberate. When the tag is clicked, it will emit the
		// selection event (similar to how #OO.ui.MultioptionWidget emits 'change')
		// and can be handled separately.
		.on( 'mousedown', function ( e ) { e.stopPropagation(); } );

	// Initialization
	this.$element
		.addClass( 'oo-ui-tagItemWidget' )
		.append( this.$label, this.closeButton.$element );
};

/* Initialization */

OO.inheritClass( OO.ui.TagItemWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.TagItemWidget, OO.ui.mixin.ItemWidget );
OO.mixinClass( OO.ui.TagItemWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.TagItemWidget, OO.ui.mixin.FlaggedElement );
OO.mixinClass( OO.ui.TagItemWidget, OO.ui.mixin.TabIndexedElement );
OO.mixinClass( OO.ui.TagItemWidget, OO.ui.mixin.DraggableElement );

/* Events */

/**
 * @event remove
 *
 * A remove action was performed on the item
 */

/**
 * @event navigate
 * @param {string} direction Direction of the movement, forward or backwards
 *
 * A navigate action was performed on the item
 */

/**
 * @event select
 *
 * The tag widget was selected. This can occur when the widget
 * is either clicked or enter was pressed on it.
 */

/**
 * @event valid
 * @param {boolean} isValid Item is valid
 *
 * Item validity has changed
 */

/**
 * @event fixed
 * @param {boolean} isFixed Item is fixed
 *
 * Item fixed state has changed
 */

/* Methods */

/**
 * Set this item as fixed, meaning it cannot be removed
 *
 * @param {string} [state] Item is fixed
 * @fires fixed
 */
OO.ui.TagItemWidget.prototype.setFixed = function ( state ) {
	state = state === undefined ? !this.fixed : !!state;

	if ( this.fixed !== state ) {
		this.fixed = state;
		if ( this.closeButton ) {
			this.closeButton.toggle( !this.fixed );
		}

		if ( !this.fixed && this.elementGroup && !this.elementGroup.isDraggable() ) {
			// Only enable the state of the item if the
			// entire group is draggable
			this.toggleDraggable( !this.fixed );
		}
		this.$element.toggleClass( 'oo-ui-tagItemWidget-fixed', this.fixed );

		this.emit( 'fixed', this.isFixed() );
	}
	return this;
};

/**
 * Check whether the item is fixed
 */
OO.ui.TagItemWidget.prototype.isFixed = function () {
	return this.fixed;
};

/**
 * @inheritdoc
 */
OO.ui.TagItemWidget.prototype.setDisabled = function ( state ) {
	if ( state && this.elementGroup && !this.elementGroup.isDisabled() ) {
		OO.ui.warnDeprecation( 'TagItemWidget#setDisabled: Disabling individual items is deprecated and will result in inconsistent behavior. Use #setFixed instead. See T193571.' );
	}
	// Parent method
	OO.ui.TagItemWidget.parent.prototype.setDisabled.call( this, state );
	if (
		!state &&
		// Verify we have a group, and that the widget is ready
		this.toggleDraggable && this.elementGroup &&
		!this.isFixed() &&
		!this.elementGroup.isDraggable()
	) {
		// Only enable the draggable state of the item if the
		// entire group is draggable to begin with, and if the
		// item is not fixed
		this.toggleDraggable( !state );
	}

	if ( this.closeButton ) {
		this.closeButton.setDisabled( state );
	}

	return this;
};

/**
 * Handle removal of the item
 *
 * This is mainly for extensibility concerns, so other children
 * of this class can change the behavior if they need to. This
 * is called by both clicking the 'remove' button but also
 * on keypress, which is harder to override if needed.
 *
 * @fires remove
 */
OO.ui.TagItemWidget.prototype.remove = function () {
	if ( !this.isDisabled() && !this.isFixed() ) {
		this.emit( 'remove' );
	}
};

/**
 * Handle a keydown event on the widget
 *
 * @fires navigate
 * @fires remove
 * @param {jQuery.Event} e Key down event
 * @return {boolean|undefined} false to stop the operation
 */
OO.ui.TagItemWidget.prototype.onKeyDown = function ( e ) {
	var movement;

	if ( !this.isDisabled() && !this.isFixed() && e.keyCode === OO.ui.Keys.BACKSPACE || e.keyCode === OO.ui.Keys.DELETE ) {
		this.remove();
		return false;
	} else if ( e.keyCode === OO.ui.Keys.ENTER ) {
		this.select();
		return false;
	} else if (
		e.keyCode === OO.ui.Keys.LEFT ||
		e.keyCode === OO.ui.Keys.RIGHT
	) {
		if ( OO.ui.Element.static.getDir( this.$element ) === 'rtl' ) {
			movement = {
				left: 'forwards',
				right: 'backwards'
			};
		} else {
			movement = {
				left: 'backwards',
				right: 'forwards'
			};
		}

		this.emit(
			'navigate',
			e.keyCode === OO.ui.Keys.LEFT ?
				movement.left : movement.right
		);
		return false;
	}
};

/**
 * Select this item
 *
 * @fires select
 */
OO.ui.TagItemWidget.prototype.select = function () {
	if ( !this.isDisabled() ) {
		this.emit( 'select' );
	}
};

/**
 * Set the valid state of this item
 *
 * @param {boolean} [valid] Item is valid
 * @fires valid
 */
OO.ui.TagItemWidget.prototype.toggleValid = function ( valid ) {
	valid = valid === undefined ? !this.valid : !!valid;

	if ( this.valid !== valid ) {
		this.valid = valid;

		this.setFlags( { invalid: !this.valid } );

		this.emit( 'valid', this.valid );
	}
};

/**
 * Check whether the item is valid
 *
 * @return {boolean} Item is valid
 */
OO.ui.TagItemWidget.prototype.isValid = function () {
	return this.valid;
};
