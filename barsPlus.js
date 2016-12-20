define( [
	"jquery",
	"./barsPlus-initprops",
	"./barsPlus-props",
	"text!./barsPlus-template.html",
	"./barsPlus-directive"
],

function ($, initprops, props, template) {
	'use strict';
	
	return {
		initialProperties: initprops,
		definition: props,
		support: {
			snapshot: true,
			export: true,
			exportData : true
		},
//		resize: function($element, layout) {
//			console.log('resize>',$element,layout,$element.scope());
//		},
		template: template,
		controller: ['$scope', function($scope) {			
		}],
		paint: function ($element, layout) {
			var self = this;
			self.$scope.g.self = self; // Save reference for call to backendApi
//d3.selectAll(".selected").classed("selected",false);

			// Only repaint here when in edit mode
			self.$scope.g.editMode = (self.options.interactionState == 2);
			if (self.$scope.g.editMode) {
				self.$scope.initProps();
				self.$scope.g.initData();
				self.$scope.g.refreshChart();
			}
		}
	};
});
