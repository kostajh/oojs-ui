/**
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.ToggleWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [value=false] Initial value
 */
OO.ui.ToggleSwitchWidget = function OoUiToggleSwitchWidget( config ) {
	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.ToggleWidget.call( this, config );

	// Properties
	this.dragging = false;
	this.dragStart = null;
	this.sliding = false;
	this.$on = this.$( '<span>' );
	this.$grip = this.$( '<span>' );

	// Events
	this.$element.on( 'click', OO.ui.bind( this.onClick, this ) );

	// Initialization
	this.$on.addClass( 'oo-ui-toggleSwitchWidget-on' );
	this.$grip.addClass( 'oo-ui-toggleSwitchWidget-grip' );
	this.$element
		.addClass( 'oo-ui-toggleSwitchWidget' )
		.append( this.$on, this.$grip );
};

/* Inheritance */

OO.inheritClass( OO.ui.ToggleSwitchWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.ToggleSwitchWidget, OO.ui.ToggleWidget );

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.ToggleSwitchWidget.prototype.onClick = function ( e ) {
	if ( !this.disabled && e.which === 1 ) {
		this.setValue( !this.value );
	}
};
