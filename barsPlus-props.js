define( [ ],
/**
 * barsPlus Properties - set up appearance of accordion properties panel in Qlik Sense
 * 
 * Defaults are defined here.
 * Settings modify objects in object: layout.props
 *
 * Author: L. Woodside
 * Modification History:
 *
 *	Version		Person			Date			Description
 *	V1.0.0		L. Woodside		19-Dec-2016		Initial Release
 *
*/
function () {
	'use strict';
	var dimensions = {
		uses: "dimensions",
		min: 1,
		max: 2
	};
	var measures = {
		uses: "measures",
		min: 1,
		max: 1
	};
	var sorting = {
		uses: "sorting"
	};
	var addons = {
		uses: "addons"
		,items: {
			dataHandling: {
				uses: "dataHandling"
			},
			selectionMode: {
				type: "string",
				component: "dropdown",
				label: "Selection mode",
				ref: "selectionMode",
				defaultValue: "CONFIRM",
				options: [
					{ value: "CONFIRM", label: "Standard"},
					{ value: "QUICK", label: "Quick"}
				]
			}
		}
	};
	
	var appearance = {
		uses: "settings",
		items: {
			presentation: {
				type: "items",
				label: "Presentation",
				items: {
					orientation: {
						type: "string",
						component: "dropdown",
						label: "Orientation",
						ref: "props.orientation",
						defaultValue: "V",
						options: [
							{ value: "V", label: "Vertical bars"},
							{ value: "H", label: "Horizontal bars"},
						]
					},
					normalized: {
						type: "boolean",
						component: "switch",
						label: "100% bar chart",
						ref: "props.normalized",
						defaultValue: false,
						options: [
							{ value: false, label: "Not 100%"},
							{ value: true, label: "100% bars"}
						],
						show: function(data) { return (data.qHyperCubeDef.qDimensions.length > 1); }
					},
					showDeltas: {
						type: "boolean",
						component: "switch",
						label: "Show bar connectors",
						ref: "props.showDeltas",
						defaultValue: false,
						options: [
							{ value: false, label: "Standard bars"},
							{ value: true, label: "Bars with connectors"}
						],
						show: function(data) { return (data.qHyperCubeDef.qDimensions.length > 1); }
					},
					barSpacing: {
						type: "number",
						label: "Bar spacing",
						ref: "props.barSpacing",
						defaultValue: 0.3,
						expression: "optional"
					},
					barSpacing2: {
						type: "number",
						component: "slider",
						ref: "props.barSpacing",
						defaultValue: 0.3,
						min: 0,
						max: 1.001,  // Excludes 1 otherwise
						step: 0.1
					},
					outerGap: {
						type: "number",
						label: "Outer bar spacing",
						ref: "props.outerGap",
						defaultValue: 0.1,
						expression: "optional"
					},
					outerGap2: {
						type: "number",
						component: "slider",
						ref: "props.outerGap",
						defaultValue: 0.1,
						min: 0,
						max: 1.001,  // Excludes 1 otherwise
						step: 0.1
					},
					gridHeight: {
						type: "number",
						label: "Grid height relative to max bar",
						ref: "props.gridHeight",
//						defaultValue: 1.1,
						expression: "optional"
					},
					gridHeight2: {
						type: "number",
						component: "slider",
//						label: "Grid height relative to max",
						ref: "props.gridHeight",
						defaultValue: 1.1,
						min: 1,
						max: 2.001,
						step: 0.1
					},
// Future enhancement
//					valueLabels: {
//						type: "boolean",
//						component: "switch",
//						label: "Value labels",
//						ref: "props.valueLabels",
//						defaultValue: false,
//						options: [
//							{ value: true, label: "Labels on bars"},
//							{ value: false, label: "No labels"}
//						]
//					},
					backgroundColor: {
						type: "string",
						label: "Background color",
						ref: "props.backgroundColor",
						defaultValue: "white",
						expression: "optional"
					},
				}
			},
			colors: {
				type: "items",
				label: "Colors and Legend",
				items: {
					colorScheme: {
						type: "string",
						component: "dropdown",
						label: "Color scheme",
						ref: "props.colorScheme",
						defaultValue: "category20b",
						options: [
							{ value: "category20b", label: "category20b"},
							{ value: "category20c", label: "category20c"},
							{ value: "category20", label: "catagory20"},
							{ value: "category10", label: "category10"},
							{ value: "google20", label: "google20"},
							{ value: "custom100", label: "custom100"},
							{ value: "qlikView18", label: "qlikView18"},
							{ value: "qlikSense12", label: "qlikSense12"}
						]
					},
					colorOffset: {
						type: "number",
						label: "Start offset in color scheme",
						ref: "props.colorOffset",
						defaultValue: 0,
						expression: "optional"
					},
					singleColor: {
						type: "boolean",
						component: "switch",
						label: "Single Color",
						ref: "props.singleColor",
						defaultValue: true,
						options: [
							{ value: true, label: "Single Color"},
							{ value: false, label: "Multi-color"}
						],
						show: function(data) { return (data.qHyperCubeDef.qDimensions.length == 1); }
					},
					showLegend: {
						type: "boolean",
						component: "switch",
						label: "Show legend",
						ref: "props.showLegend",
						defaultValue: false,
						options: [
							{ value: false, label: "No legend"},
							{ value: true, label: "Show legend"}
						],
						show: function(data) { return (data.qHyperCubeDef.qDimensions.length > 1); }
					},
					legendPosition: {
						type: "string",
						component: "dropdown",
						label: "Legend position",
						ref: "props.legendPosition",
						defaultValue: "R",
						options: [
							{ value: "R", label: "Right"},
							{ value: "L", label: "Left"},
							{ value: "T", label: "Top"},
							{ value: "B", label: "Bottom"}
						],
						show: function( data ){ 
							return data.props.showLegend
								&& (data.qHyperCubeDef.qDimensions.length > 1); 
							}
					},
					legendSize: {
						type: "string",
						component: "dropdown",
						label: "Legend size",
						ref: "props.legendSize",
						defaultValue: "M",
						options: [
							{ value: "N", label: "Narrow"},
							{ value: "M", label: "Medium"},
							{ value: "W", label: "Wide"}
						],
						show: function( data ){ 
							return data.props.showLegend
								&& (data.qHyperCubeDef.qDimensions.length > 1); 
							}
					},
					legendSpacing: {
						type: "string",
						component: "dropdown",
						label: "Legend item spacing",
						ref: "props.legendSpacing",
						defaultValue: "M",
						options: [
							{ value: "N", label: "Narrow"},
							{ value: "M", label: "Medium"},
							{ value: "W", label: "Wide"}
						],
						show: function( data ){ 
							return data.props.showLegend
								&& (data.qHyperCubeDef.qDimensions.length > 1)
								&& (data.props.legendPosition == "T" || data.props.legendPosition == "B"); 
							}
					}
				}
			},
			dimensionAxis: {
				type: "items",
				label: function(data) {
					var t = "";
					if (data.qHyperCubeDef.qDimensions.length > 0) {
						t = data.qHyperCubeDef.qDimensions[0].qDef.qFieldLabels[0];
						if (t.length == 0) {
							t = data.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs[0];
						}
						t = " (" + (t.startsWith("=") ? t.slice(1) : t) + ")";
					};
					return (data.props.orientation == "V" ? "X" : "Y") + "-Axis" + t;
				},
				items: {
					LabelTitleD: {
						type: "string",
						component: "dropdown",
						label: "Labels and title",
						ref: "props.labelTitleD",
						defaultValue: "B",
						options: [
							{ value: "B", label: "Labels and title"},
							{ value: "L", label: "Labels only"},
							{ value: "T", label: "Titles only"},
							{ value: "N", label: "None"}
						]
					},
					LabelStyleD: {
						type: "string",
						component: "dropdown",
						label: "Label style",
						ref: "props.labelStyleD",
						defaultValue: "A",
						options: [
							{ value: "A", label: "Auto"},
							{ value: "H", label: "Horizontal"},
							{ value: "S", label: "Staggered"},
							{ value: "T", label: "Tilted"}
						],
						show: function(data) { 
								return data.props.labelTitleD != 'N'
									&& data.props.labelTitleD != 'T';
							}
					},
					gridlinesD: {
						type: "boolean",
						component: "switch",
						label: "Gridlines",
						ref: "props.gridlinesD",
						defaultValue: false,
						options: [
							{ value: true, label: "Gridlines"},
							{ value: false, label: "No gridlines"}
						],
						show: function(data) { 
								return data.props.labelTitleD != 'N'
									&& data.props.labelTitleD != 'T';
							}
					},
					axisMarginD: {
						type: "string",
						component: "dropdown",
						label: "Dimension margin size",
						ref: "props.axisMarginD",
						defaultValue: "M",
						options: [
							{ value: "N", label: "Narrow"},
							{ value: "M", label: "Medium"},
							{ value: "W", label: "Wide"}
						],
						show: function(data) { 
								return data.props.labelTitleD != 'N'
									&& data.props.labelTitleD != 'T';
							}
					}
				}
			},
			measureAxis: {
				type: "items",
				label: function(data) {
					var t = "";
					if (data.qHyperCubeDef.qMeasures.length > 0) {
						if (data.qHyperCubeDef.qMeasures[0].qDef.hasOwnProperty("qLabel")) {
							t = data.qHyperCubeDef.qMeasures[0].qDef.qLabel;
						}
						else {
							t = data.qHyperCubeDef.qMeasures[0].qDef.qDef;
						}
						t = " (" + (t.startsWith("=") ? t.slice(1) : t) + ")";
					};
					return (data.props.orientation == "V" ? "Y" : "X") + "-Axis" + t;
				},
				items: {
					labelTitleM: {
						type: "string",
						component: "dropdown",
						label: "Labels and title",
						ref: "props.labelTitleM",
						defaultValue: "B",
						options: [
							{ value: "B", label: "Labels and title"},
							{ value: "L", label: "Labels only"},
							{ value: "T", label: "Titles only"},
							{ value: "N", label: "None"}
						]
					},
					LabelStyleM: {
						type: "string",
						component: "dropdown",
						label: "Label style",
						ref: "props.labelStyleM",
						defaultValue: "A",
						options: [
							{ value: "A", label: "Auto"},
							{ value: "H", label: "Horizontal"},
							{ value: "S", label: "Staggered"},
							{ value: "T", label: "Tilted"}
						],
						show: function(data) { 
								return data.props.labelTitleM != 'N'
									&& data.props.labelTitleM != 'T';
							}
					},
					gridlinesM: {
						type: "boolean",
						component: "switch",
						label: "Gridlines",
						ref: "props.gridlinesM",
						defaultValue: true,
						options: [
							{ value: true, label: "Gridlines"},
							{ value: false, label: "No gridlines"}
						],
						show: function(data) { 
								return data.props.labelTitleM != 'N'
									&& data.props.labelTitleM != 'T';
							}
					},
					axisMarginM: {
						type: "string",
						component: "dropdown",
						label: "Measure margin size",
						ref: "props.axisMarginM",
						defaultValue: "M",
						options: [
							{ value: "N", label: "Narrow"},
							{ value: "M", label: "Medium"},
							{ value: "W", label: "Wide"}
						],
						show: function(data) { 
								return data.props.labelTitleM != 'N'
									&& data.props.labelTitleM != 'T';
							}
					},
					ticks: {
						type: "string",
						component: "dropdown",
						label: "Measure Tick spacing",
						ref: "props.ticks",
						defaultValue: "5",
						options: [
							{ value: "5", label: "Wide"},
							{ value: "10", label: "Medium"},
							{ value: "20", label: "Narrow"}
						],
						show: function(data) { 
								return data.props.labelTitleM != 'N'
									&& data.props.labelTitleM != 'T';
							}
					},
					axisFormatM: {
						type: "string",
						component: "dropdown",
						label: "Measure axis number format",
						ref: "props.axisFormatM",
						defaultValue: "S",
						options: [
							{ value: "A", label: "Auto"},
							{ value: "N", label: "Number"},
							{ value: "P", label: "Percent"},
							{ value: "S", label: "SI-notation (K, M, etc.)"},
							{ value: "C", label: "Custom"}
						],
						show: function(data) { 
								return data.props.labelTitleM != 'N'
									&& data.props.labelTitleM != 'T';
							}
					},
					axisFormatMs: {
						type: "string",
						label: "Measure axis number format string",
						ref: "props.axisFormatMs",
						defaultValue: "s",
						expression: "optional",
						show: function(data) { return data.props.axisFormatM == "C"; }
					},
					axisFormatMURL: {
						type: "string",
						component: "link",
						label: "D3 format strings",
						url: "https://github.com/d3/d3-3.x-api-reference/blob/master/Formatting.md"
					}
				}
			},
			transitions: {
				type: "items",
				label: "Transitions",
				items: {
					transitions: {
						type: "boolean",
						component: "switch",
						label: "Transitions",
						ref: "props.transitions",
						defaultValue: true,
						options: [
							{ value: true, label: "Transitions enabled"},
							{ value: false, label: "Transitions disabled"}
						]
					},
					transitionDelay: {
						type: "string",
						label: "Transition delay",
						ref: "props.transitionDelay",
						defaultValue: "500",
						expression: "optional",
						show: function( data ){ return data.props.transitions; }
					},
					transitionDuration: {
						type: "string",
						label: "Transition duration",
						ref: "props.transitionDuration",
						defaultValue: "1000",
						expression: "optional",
						show: function(data) { return data.props.transitions; }
					},
					transitionStyle: {
						type: "string",
						component: "dropdown",
						label: "Transition style",
						ref: "props.ease",
						defaultValue: "linear",
						options: [
							{ value: "linear", label: "Linear"},
							{ value: "quad", label: "Quad"},
							{ value: "cubic", label: "Cubic"},
							{ value: "sin", label: "Sine"},
							{ value: "exp", label: "Exponential"},
							{ value: "circle", label: "Circle"},
							{ value: "elastic", label: "Elastic"},
							{ value: "back", label: "Back"},
							{ value: "bounce", label: "Bounce"}
						],
						show: function( data ){ return data.props.transitions; }
					}
				}
			}
		}
	}
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: dimensions,
			measures: measures,
			sorting: sorting,
			addons: addons,
			appearance: appearance
		}
	};

} );
