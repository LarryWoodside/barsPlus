/**
 * barsPlus AngularJS Directive
 * 
 * Define AngularJS directive
 * Sets up properties of object ldwBarsPlus (variable 'g') and defines watches
 *
 * Author: L. Woodside
 * Modification History:
 *
 *	Version		Person			Date			Description
 *	V1.0.0		L. Woodside		19-Dec-2016		Initial Release
 *	V1.1.0		L. Woodside		29-Dec-2016		Added text on bars
 *
*/
define( [
	"jquery",
	"qvangular",
	"./ldw-barsPlus",
	"css!./barsPlus.css",
	"./lib/d3.v3"
],

function ($, qvangular, ldwBarsPlus) {
	'use strict';
	
	qvangular.directive("barsPlus", [
		function() {
			return {
				restrict: "EA",
				link: function($scope, $element, $attrs) {

					$scope.g = Object.create(ldwbarsPlus);

					var g = $scope.g;

					// package parameters so bar chart js can be tested in standalone HTML
					// with different input data structure
					$scope.initProps = function() {
						var g = $scope.g, l = $scope.layout, p = $scope.layout.props;

						g.id = l.qInfo.qId;
						g.inSelections = false;
						g.editMode = false;
						g.selectionMode = l.selectionMode;
						
						g.axisTitleD = l.qHyperCube.qDimensionInfo[0].qFallbackTitle;
						g.axisTitleM = l.qHyperCube.qMeasureInfo[0].qFallbackTitle;

						// Presentation				
						g.orientation = p.orientation;
						g.normalized = p.normalized;
						g.showDeltas = p.showDeltas
						g.barGap = p.barSpacing;
						g.outerGap = p.outerGap
						g.gridHeight = p.gridHeight;
						g.backgroundColor = p.backgroundColor;
						g.colorScheme = p.colorScheme;
						g.colorOffset = p.colorOffset;
						
						// Colors and Legend
						g.singleColor = p.singleColor;
						g.showLegend = p.showLegend;
						g.legendPosition = p.legendPosition;
						g.legendSize = p.legendSize;
						g.legendSpacing = p.legendSpacing;
						
						// Dimension Axis
						g.labelTitleD = p.labelTitleD;
						g.labelStyleD = p.labelStyleD;
						g.gridlinesD = p.gridlinesD;
						g.axisMarginD = p.axisMarginD;

						// Measure Axis
						g.labelTitleM = p.labelTitleM;
						g.labelStyleM = p.labelStyleM;
						g.gridlinesM = p.gridlinesM;
						g.axisMarginM = p.axisMarginM;
						g.ticks = p.ticks;
						g.axisFormatM = p.axisFormatM;
						g.axisFormatMs = p.axisFormatMs;
						
						// Text on bars

						g.showTexts = p.showTexts;
						g.showDim = p.showDim;
						g.showTot = p.showTot;
						g.innerBarPadH = p.innerBarPadH;
						g.innerBarPadV = p.innerBarPadV;
						g.textSizeAbs = p.textSizeAbs;
						g.textSizeFactor = p.textSizeFactor;
						g.textSize = p.textSize;
						g.textDots = p.textDots;
						g.textColor = p.textColor;
						g.vAlign = p.vAlign;
						g.hAlign = p.hAlign;
						g.totalFormatM = p.totalFormatM;
						g.totalFormatMs = p.totalFormatMs;

						// Transitions
						g.transitions = p.transitions;
						g.transitionDelay = p.transitionDelay;
						g.transitionDuration = p.transitionDuration;
						g.ease = p.ease

					};
					
					$scope.initProps();

					g.component = d3.select($element[0]).attr("id",g.id)

					g.width = $element.parent().width();
					g.height = $element.parent().height();
					g.rawData = $scope.layout.qHyperCube.qDataPages[0].qMatrix;
					
					g.initData();
					g.refreshChart();

					// watch for when data changes
					$scope.$watch(function() { return $scope.layout.qHyperCube.qDataPages[0].qMatrix; }
						,function(newValue, oldValue) {
							if (newValue != oldValue) {
								g.rawData = newValue;
								g.initData();
								g.updateBars();
							}
					});
					// watch for when chart is resized
					$scope.$watch(
						function () {
							return $element.parent().width() + "," + $element.parent().height();
						}
						,function(newValue, oldValue) {
							if (newValue != oldValue) {

								var t = newValue.split(",");
								g.width = t[0];
								g.height = t[1];
								
								g.refreshChart();
							}
						}
					);
					// watch for selection count going to zero in standard selection mode
					// to partially address QS bug where clear selections button does not reset element classes
					// this does not completely work if there were existing selections on field prior to entering
					// selection mode
					$scope.$watch(
						function() {
								return $scope.layout.qHyperCube.qDimensionInfo[0].qStateCounts.qSelected;
						}
						,function(newValue, oldValue) {

							if (newValue != oldValue && newValue == 0) {
								d3.selectAll(".selected").classed("selected",false);
							}
						}
					);
					// watch for when selection mode enabled
					$scope.$watch(
						function() {
							return $scope.layout.qSelectionInfo.qInSelections;
						}
						,function(newValue, oldValue) {
							if (newValue != oldValue) {

								g.inSelections = newValue || false;
								if (!g.inSelections) {
									d3.selectAll(".selected").classed("selected",false);
								}
							}
						}
					);
				}
			}
		}
	]);
	
});
