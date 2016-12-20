/**

 barsPlus - Create D3 bar chart, stacked bar chart, area chart
 
 Author: L. Woodside
 Modification History:
 
	Version		Person			Date			Description
	V1.0.0		L. Woodside		19-Dec-2016		Initial Release

 Dependencies: d3.v3.js

 This script creates an object with the following methods:
 
	initData()		Initialize chart data
	initChart()		Initialize a bar chart
	createBars()	Create the bars in the chart
	updateBars()	modify the bar chart due to changes in data
	refreshChart()	refresh chart (calls three above excluding initData)

 Presentation Properties
 
 orientation		Orientation: H - Horizontal, V - Vertical
 normalized			Whether 100% bars
 showDeltas			Whether to show bar connectors (delta quadrangles)
 barGap				Spacing between bars, 0 - no space, 1 - no bars (area graph)
 outerGap			Spacing before first bar and after last bar
 gridHeight			Height of grid relative to highest bar
 backgroundColor	Grid background color
 colorScheme		Named color scheme
 colorOffset		Offset of first color in color scheme

 Colors and Legend
 
 singleColor		Whether to use single color for 1-dimensional bars
 showLegend			Whether to show the legend
 legendPosition		Legend position: T - top, R - right, B - bottom, L - left
 legendSize			Legend size: N - narrow, M - medium, W - wide
 legendSpacing		Legend spacing: N - narrow, M - medium, W - wide

 Dimension Axis
 
 axisTitleD			Dimension axis title
 labelTitleD		Dimension axis: B - labels & title, L - labels only, T - titles only, N - none
 labelStyleD		Dimension style: A - Auto, H - horizontal, S - staggered, T - tilted
 gridlinesD			Dimension gridlines
 axisMarginD		Dimension margin size: N - narrow, M - medium, W - wide

 Measure Axis
 
 axisTitleM			Measure axis title
 labelTitleM		Measure axis: B - labels & title, L - labels only, T - titles only, N - none
 labelStyleM		Measure style: A - Auto, H - horizontal, S - staggered, T - tilted
 gridlinesM			Measure gridlines
 axisMarginM		Measure margin size: N - narrow, M - medium, W - wide
 ticks				Recommended number of ticks
 axisFormatM		Number format for measure axis, A - Auto, N - Number, P - Percent, S - SI, C - Custom
 axisFormatMs		Number format string for measure axis, D3 format
 
 Transitions
 
 transitions		Whether to enable transitions
 transitionDelay	Delay before start of transition
 transitionDuration	Duration of transition
 ease				Transition style

 UI-determined Properties
 
 id					Unique id of enclosing element
 component			D3 selection of enclosing element
 width				Width of enclosing element
 height				Height of enclosing element
 inSelections		Whether selection mode is enabled in Qlik Sense
 editMode			Whether edit mode is enabled in Qlik Sense
 selectionMode		Selection mode: QUICK or CONFIRM
 rawData			Raw data from hypercube
 
*/
var ldwbarsPlus = {

/**
 *--------------------------------------
 * Initialize Data
 *--------------------------------------
 * This method will take input QV data and format it for 1 or 2 dimensions
 * Input:	g.rawData
 * Output:	g.data
 *			g.flatData
 *			g.allDim2
 *			g.nDims
 *			g.deltas
*/
initData: function() {

	var g = this;

	var struc = [], flatData = [], q = [], deltas = [];
	
	if (!g.rawData[0]) return; // sometimes undefined
	// Process one dimension data
	if (g.rawData[0].length == 2) {
		g.nDims = 1;
		g.normalized = false;
		g.rawData.forEach(function(d) {
			struc.push({dim1: d[0].qText, total: d[1].qNum});
			flatData.push({
					dim1: d[0].qText, 
					dim2: d[0].qText, 
					offset: 0, 
					qNum: d[1].qNum, 
					qText: d[1].qText,
					qTextPct: "",
					qElemNumber: d[0].qElemNumber
				});
			if(q.indexOf(d[0].qText) == -1) {
				q.push(d[0].qText);
			}
		});
		g.data = struc;
		g.flatData = flatData;
		g.allDim2 = q;
		return;		
	};
	// Process two dimension data
	g.nDims = 2;
	// Process the two dimensional data

	var p1 = "", p2, edges = [], b, p = [];
	g.rawData.forEach(function(d) {
		var c2 = d[1].qText;
		if (p.indexOf(d[0].qText) == -1) {
			p.push(d[0].qText);
		}
		if (q.indexOf(d[1].qText) == -1) {
			q.push(d[1].qText);
		}
		if (d[0].qText != p1) {
			p1 = d[0].qText;
		}
		else {
			b = false;
			for (var i = 0; i < edges.length; i++) {
				if (edges[i][0] == p2 && edges[i][1] == c2) {
					b = true;
					break;
				}
			}
			if (!b) {
				edges.push([p2,c2])
			}
		}
		p2 = c2;
	});
	// Topological sort will throw an error if inconsistent data (sorting by measure)
	// Just ignore errors and use original sort order
	var qs;
	try {
		qs = this.toposort(q,edges);
	}
	catch(err) {
		qs = q;
	}
	q = qs;		

	var n = d3.nest()
		.key(function(d) {return d[0].qText})
		.key(function(d) {return d[1].qText})
		.entries(g.rawData)
		;
	// sort all nodes in order specified by q
	n.forEach(function(d) {
		d.values.sort(function(a,b) {
			return ( q.indexOf(a.key) < q.indexOf(b.key) ? -1 
				: ( q.indexOf(a.key) > q.indexOf(b.key) ? 1 : 0));
		});
	});
	// nest messes up dim1 sort order, sort by order specified in p
	n.sort(function(a,b) {
		return ( p.indexOf(a.key) < p.indexOf(b.key) ? -1
			: ( p.indexOf(a.key) > p.indexOf(b.key) ? 1 : 0));
	});
	n.forEach(function(d, idx) {
		var t = 0, v = [], j = 0, num, txt;
		for (var i = 0; i < q.length; i++) {
			if (d.values.length <= j || d.values[j].key != q[i]) {
				num = 0;
				txt = "-";
				elm = [];
			}
			else {
				num = d.values[j].values[0][2].qNum;
				txt = d.values[j].values[0][2].qText;
				elm = d.values[j].values[0][0].qElemNumber;
				j++;
			}
			v.push({
				dim2: q[i],
				qNum: num,
				qText: txt,
				qElemNumber: elm,
				offset: t		
			});
			t += num;
		};
		v.forEach(function(e) {
			e.dim1 = d.key;
			if (g.normalized) {
				e.offset = e.offset/t;
				e.qNum = e.qNum/t;
				e.qTextPct = d3.format(".1%")(e.qNum);
			}
		});
		flatData.push.apply(flatData,v);
		struc.push({dim1: d.key, total: t, values: v});
		
		if (idx > 0 && g.showDeltas) {
			var p = struc[idx-1].values;
			var c = struc[idx].values;
			for (var k = 0; k < p.length; k++) {
				deltas.push({
					dim1p: p[k].dim1,
					dim1c: c[k].dim1,
					dim2: p[k].dim2,
					delta: c[k].qNum - p[k].qNum,
					deltaPct: 0,
					points: [
						p[k].offset,
						c[k].offset,
						p[k].qNum,
						c[k].qNum
					]
				});
			}
		}

	});
	g.data = struc;
	g.flatData = flatData;
	g.allDim2 = q;
	g.deltas = deltas;
},

/**
 *--------------------------------------
 * Initialize Chart
 *--------------------------------------
 * Set up initial elements, create axes, create legend
 * create bars, deltas and legend items and bind data
*/
initChart: function() {

	var g = this;

	var xLabelTitle = g.orientation == "V" ? g.labelTitleD : g.labelTitleM;
	g.xAxisHeight = xLabelTitle == "B" || xLabelTitle == "L" 
		? [70,40,25]["WMN".indexOf(g.orientation == "V" ? g.axisMarginD : g.axisMarginM)] : 0;
	var xTitleHeight = xLabelTitle == "B" || xLabelTitle == "T" ? 20 : 0;
	var xAxisPad = 20;

	var yLabelTitle = g.orientation == "V" ? g.labelTitleM : g.labelTitleD;
	g.yAxisWidth = yLabelTitle == "B" || yLabelTitle == "L" 
		? [90,50,30]["WMN".indexOf(g.orientation == "V" ? g.axisMarginM : g.axisMarginD)] : 0;
	var yTitleWidth = yLabelTitle == "B" || yLabelTitle == "T" ? 20 : 0;
	var yAxisPad = 20;

	var tr; // translate string
	var dTitleHeight = g.labelTitleD == "B" || g.labelTitleD == "T" ? 20 : 0;
	var margin = {
		top: 10, //yAxisPad, 
		right: xAxisPad, 
		bottom: g.xAxisHeight + xTitleHeight + xAxisPad,
		left: g.yAxisWidth + yTitleWidth + yAxisPad
	};
	var innerWidth = g.width - margin.left - margin.right;
	var innerHeight = g.height - margin.top - margin.bottom;

	g.lgn = {
		minDim  : [200,100], // min inner dimensions for legend to be displayed
		use : "",
		pad : 0,
		sep : 5,
		box : [12,12],  // legend item color box
		itmHeight : 20,
	}
	g.lgn.txtOff = g.lgn.box[0] + g.lgn.pad + g.lgn.sep;
	
	// adjust for legend if any
	g.lgn.use = (g.showLegend && g.nDims == 2) ? g.legendPosition : "";
	if (g.lgn.use) {
		if (g.lgn.use == "L" || g.lgn.use == "R") {
			if (innerWidth <= g.lgn.minDim[0]) {
				g.lgn.use = "";
			}
			else {
				g.lgn.width = innerWidth/([4,6,10]["WMN".indexOf(g.legendSize)]);
				innerWidth -= (g.lgn.width + yAxisPad);
				g.lgn.height = innerHeight + g.xAxisHeight + xTitleHeight;
				g.lgn.y = margin.top;
				g.lgn.txtWidth = g.lgn.width - g.lgn.pad - g.lgn.sep - g.lgn.box[0];
				if (g.lgn.use == "L") {
					g.lgn.x = yAxisPad;
					margin.left += g.lgn.width + g.lgn.x;
				}
				else {
					g.lgn.x = margin.left + innerWidth + yAxisPad;
				}	
			}
		}
		else if (g.lgn.use == "T" || g.lgn.use == "B") {
			if (innerHeight <= g.lgn.minDim[1]) {
				g.lgn.use = "";
			}
			else {
				g.lgn.width = innerWidth + g.yAxisWidth + yTitleWidth;
				g.lgn.height = g.lgn.itmHeight * (3 - "WMN".indexOf(g.legendSize));
				innerHeight -= g.lgn.height;
				g.lgn.x = yAxisPad;
				g.lgn.txtWidth = [100,75,50]["WMN".indexOf(g.legendSpacing)];
				if (g.lgn.use == "T") {
					g.lgn.y = margin.top;
					margin.top += g.lgn.height
				}
				else {
					g.lgn.y = margin.bottom + innerHeight;
					innerHeight -= 10;
				}	
			}
		}
	}
	g.component.selectAll("*")
		.remove()
		;
	var tooltip = g.component.append("div")
		.attr("class","ldwtooltip")
		.style("opacity","0")
		;
	tooltip.append("p")
		.attr("class","ldwttheading")
		;
	tooltip.append("p")
		.attr("class","ldwttvalue")
		;	
	g.svg = g.component
		.append("svg")
			.attr("width",g.width)
			.attr("height",g.height)
			.style("background-color",g.backgroundColor)
		.append("g")
			.attr("transform","translate(" + margin.left + "," + margin.top + ")")
		;	
	var dim1 = g.data.map(function(d) { return d.dim1; });
	if (g.orientation == "H") dim1.reverse()
	g.dScale = d3.scale.ordinal()
		.domain(dim1)
		.rangeRoundBands(g.orientation == "V" ? [0, innerWidth] : [innerHeight,0], g.barGap, g.outerGap)
		;
	g.mScale = d3.scale.linear()
		.domain([0, d3.max(g.data, function(d) { return (g.normalized ? 1 : d.total)*g.gridHeight; })])
		.range(g.orientation == "V" ? [innerHeight,0] : [0, innerWidth])
		.nice()
		;
	var dGrp = g.svg.append("g")
			.attr("class", "ldw-d ldwaxis");
	if (g.orientation == "V") {
			dGrp.attr("transform", "translate(0," + innerHeight + ")");
	}
	if (g.labelTitleD == 'B' || g.labelTitleD == 'L') {
		g.dAxis = d3.svg.axis()
			.scale(g.dScale)
			.orient(g.orientation == "V" ? "bottom" : "left")
			.tickSize(g.gridlinesD ? (g.orientation == "V" ? -innerHeight : -innerWidth) : 6)
			.tickPadding(5)
			;
		dGrp.call(g.dAxis);
	}
	if (g.labelTitleD == 'B' || g.labelTitleD == 'T') {
		if(g.orientation == "V") {
			tr = "translate(" + (innerWidth/2) + "," + (g.xAxisHeight + xTitleHeight) + ")";
		}
		else {
			tr = "translate(-" + (g.yAxisWidth + yTitleWidth/2 + 2) + "," + (innerHeight/2) + ")rotate(-90)";
		}
		dGrp.append("text")
			.attr("class","axisTitle")
			.attr("text-anchor","middle")
			.attr("transform",tr)
			.text(g.axisTitleD)
			;
	}
	var mGrp = g.svg.append("g")
		.attr("class", "ldw-m ldwaxis")
		;
	if (g.orientation != "V") {
			mGrp.attr("transform", "translate(0," + innerHeight + ")");
	}
	if (g.labelTitleM == 'B' || g.labelTitleM == 'L') {
		g.mAxis = d3.svg.axis()
			.scale(g.mScale)
			.orient(g.orientation == "V" ? "left" : "bottom")
			.tickSize(g.gridlinesM ? (g.orientation == "V" ? -innerWidth : -innerHeight) : 6)
			.ticks(g.ticks)
			.tickFormat(d3.format(["s", ",.0f", ",.0%", "s", g.axisFormatMs]["ANPSC".indexOf(g.axisFormatM)]))
			.tickPadding(5)
			;
		mGrp.call(g.mAxis);
	}
	if (g.labelTitleM == 'B' || g.labelTitleM == 'T') {
		if(g.orientation == "V") {
			tr = "translate(-" + (g.yAxisWidth + yTitleWidth/2 + 2) + "," + (innerHeight/2) + ")rotate(-90)";
		}
		else {
			tr = "translate(" + (innerWidth/2) + "," + (g.xAxisHeight + xTitleHeight) + ")";
		}
		mGrp.append("text")
			.attr("class","axisTitle")
			.attr("text-anchor","middle")
			.attr("transform",tr)
			.text(g.axisTitleM)
			;
	}
	if (Object.getPrototypeOf(this).hasOwnProperty(g.colorScheme))
		ca = this[g.colorScheme];
	else
		ca = d3.scale[g.colorScheme]().range();
	g.colorOffset %= ca.length;
	
	if (g.nDims == 1 && g.singleColor) {
		var rc = ca[g.colorOffset];
		g.cScale = function(d) { return rc; };
	}
	else {
		g.cScale = d3.scale.ordinal().range(
			ca.slice(g.colorOffset,ca.length).concat(ca.slice(0,ca.length))
		).domain(g.allDim2);
	}
	
	// Create Legend
	if (g.lgn.use) {
		var lgn = d3.select("#" + g.id + " svg")
			.append("g")
			.attr("class","ldwlegend")
			.attr("clip-path","url(#" + g.id + "_lgnClip)")
			.attr("transform","translate(" + g.lgn.x + "," + g.lgn.y + ")")
			;
		lgn.append("rect")
			.attr("x",0)
			.attr("y",0)
			.attr("width",g.lgn.width)
			.attr("height",g.lgn.height)
			.style("fill",g.backgroundColor)
			;
		lgn.append("clipPath")
			.attr("id",g.id + "_lgnClip")
			.append("rect")
			.attr("x","0")
			.attr("y","0")
			.attr("width",g.lgn.width)
			.attr("height",g.lgn.height)
			;
		lgn.append("g")
			.attr("class","ldwlgnitems")
	}
	// Create bars
	g.bars = g.svg.selectAll("#" + g.id + " .ldwbar")
		.data(g.flatData, function(d) { return d.dim1 + '|' + d.dim2; } )
		;
	// Create deltas
	if (g.showDeltas && g.nDims == 2) {
		g.polys = g.svg.selectAll("#" + g.id + " polygon")
			.data(g.deltas, function(d) { return d.dim1p + "-" + d.dim1c + "," + d.dim2; } )
			;
	}
	// Create legend items
	if (g.lgn.use) {
		g.lgn.items = d3.select("#" + g.id + " .ldwlgnitems")
			.selectAll("g")
			.data(g.allDim2)
			;
	}
	
},
		
/**
 *--------------------------------------
 * Create Bars
 *--------------------------------------
 * Set up initial properties of bars, deltas, and legend
 * Objects already have had data bound
 * This procedure is also called from updateBars to add new items
*/
createBars: function() {

	var g = this;
	// Create bars
	g.bars
		.enter()
		.append("rect")
		.attr("ldwdim1", function(d) { return d.qElemNumber; })
		.attr(g.orientation == "V" ? "x" : "y", function(d) { return g.dScale(d.dim1); })
		.attr(g.orientation == "V" ? "y" : "x", function(d) { return g.mScale(0); })		// grow from bottom
//		.attr(g.orientation == "V" ? "y" : "x", function(d) { return g.mScale(d.offset); })	// venetian blinds
		.attr(g.orientation == "V" ? "width" : "height", g.dScale.rangeBand())
		.attr(g.orientation == "V" ? "height" : "width", function(d) { return 0; })
		.style("fill", function(d) { return g.cScale(d.dim2); })
		.style("opacity","0")
		.attr("class","selectable ldwbar")
		.on("click",function(d) {
			if (g.selectionMode == "QUICK") {
				g.self.backendApi.selectValues(0,[d.qElemNumber],true);
			}
			else if (g.selectionMode == "CONFIRM") {
				var t = d3.select(this).classed("selected");
				g.self.selectValues(0,[d.qElemNumber],true);
				var x = d3.selectAll("#" + g.id + " [ldwdim1='" + d.qElemNumber + "']")
						.classed("selected",!t);
			d3.select("#" + g.id + " .ldwtooltip")
				.style("opacity","0")
				.transition()
				.remove
				;
			}
			return; 
		})
		.on("mouseenter",function(d) {
			if (g.inSelections || g.editMode) return;
			d3.select(this)
				.style("opacity","0.5")
				.attr("stroke","white")
				.attr("stroke-width","2")
				;
			// Place text in tooltip
			d3.select("#" + g.id + " .ldwttheading")
				.text(g.nDims == 2 ? d.dim1 + ", " + d.dim2 : d.dim1);
			d3.select("#" + g.id + " .ldwttvalue")
				.text(g.nDims == 2 ? 
					(g.normalized ? d.qTextPct + ", " + d.qText : d.qText)
					: d.qText);
				
			var matrix = this.getScreenCTM()
				.translate(+this.getAttribute("x"),+this.getAttribute("y"));

			var xPosition = (window.pageXOffset + matrix.e)
				- d3.select("#" + g.id + " .ldwtooltip")[0][0].clientWidth/2
				+ (g.orientation == "V" ? g.dScale.rangeBand() : d3.select(this).attr("width"))/2
				;
			var yPosition = (window.pageYOffset + matrix.f)
				- d3.select("#" + g.id + " .ldwtooltip")[0][0].clientHeight
				-10
				;
			d3.select("#" + g.id + " .ldwtooltip")
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.transition()
				.delay(750)
				.style("opacity","0.95")
				;
		})
		.on("mouseleave",function() {
			d3.select(this)
				.style("opacity","1.0")
				.attr("stroke","none")
				;
			d3.select("#" + g.id + " .ldwtooltip")
				.style("opacity","0")
				.transition()
				.remove
				;
		})
		;

	if (g.showDeltas && g.nDims == 2) {

		// Create deltas
		g.polys
			.enter()
			.append("polygon")
			.attr("points",function(d) {
				var p;
				if (g.orientation == "V") {
					p =	(g.dScale(d.dim1p)+g.dScale.rangeBand()) + "," +
						g.mScale(0) + " " +						
						(g.dScale(d.dim1p)+g.dScale.rangeBand()) + "," +
						g.mScale(0) + " " +
						(g.dScale(d.dim1c)) + "," +
						g.mScale(0) + " " +
						(g.dScale(d.dim1c)) + "," +
						g.mScale(0)
					;
				}
				else {
					p =	g.mScale(0) + "," + (g.dScale(d.dim1p) + g.dScale.rangeBand()) + " " +
						g.mScale(0) + "," + (g.dScale(d.dim1p) + g.dScale.rangeBand()) + " " +
						g.mScale(0) + "," + g.dScale(d.dim1c) + " " +
						g.mScale(0) + "," + g.dScale(d.dim1c)
					;
				}	
				return p;
			})
			.style("fill",function(d) {
				return g.cScale(d.dim2);
			})
			.style("opacity","0")
			.on("mouseenter",function(d) {
				var pt = this.getAttribute("points").split(" ");
				var sx = 0, sy = 0;
				pt.forEach(function(e, i) {
					var x = e.split(",");
					if (g.orientation == "H") {
						if (i < 2) {
							sx += parseFloat(x[0]);
							sy += parseFloat(x[1]);
						}
					}
					else if (i == 0 || i == 3) {
						sx += parseFloat(x[0]);
						sy += parseFloat(x[1]);
					}
				} );
				sx /= 2;
				sy /= 2;

				if (g.inSelections || g.editMode) return;
				
				d3.select(this)
					.style("opacity","0.5")
					.attr("stroke","white")
					.attr("stroke-width","2");
				// Place text in tooltip
				d3.select("#" + g.id + " .ldwttheading")
					.text(d.dim2 + ", " + d.dim1p + "-" + d.dim1c);
				d3.select("#" + g.id + " .ldwttvalue")
					.text(d3.format(g.normalized ? "+.1%" : "+.3s")(d.delta));
					
				var matrix = this.getScreenCTM()
					.translate(sx,sy);

					var xPosition = (window.pageXOffset + matrix.e)
					- d3.select("#" + g.id + " .ldwtooltip")[0][0].clientWidth/2
					;
				var yPosition = (window.pageYOffset + matrix.f)
					- d3.select("#" + g.id + " .ldwtooltip")[0][0].clientHeight
					-10
					;
				d3.select("#" + g.id + " .ldwtooltip")
					.style("left", xPosition + "px")
					.style("top", yPosition + "px")
					.transition()
					.delay(750)
					.style("opacity","0.95")
					;
			})
			.on("mouseleave",function() {
				d3.select(this)
					.style("opacity",g.barGap == 1 ? "1" : "0.5")
					.attr("stroke","none")
					;
				d3.select("#" + g.id + " .ldwtooltip")
					.style("opacity","0")
					.transition()
					.remove;
			})
			;
	}
	// create legend
	if (g.lgn.use) {
		g.lgn.items
			.enter()
			.append("g")
			.attr("class","ldwlgnitem")
 			.each(function(d, i) {
				d3.select(this)
					.append("rect")
//					.attr("x","0")		// Initialize to zero to have legend grow from top
//					.attr("y","0")					
					.attr("x",function(e) {
						var x;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							x = i*(g.lgn.txtOff + g.lgn.txtWidth);
						}
						else {
							x = g.lgn.pad;
						}
						return x;
					})
					.attr("y",function(e) { 
						var y;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							y = g.lgn.pad;
						}
						else {
							y = g.lgn.pad + g.lgn.itmHeight*i;
						}
						return y;
					})
					.style("opacity","0")
				.attr("width",g.lgn.box[0])
				.attr("height",g.lgn.box[1])
				.style("fill",function(e) { return g.cScale(e); })
				;
				d3.select(this)
					.append("text")
//					.attr("x","0")		// Initialize to zero to have legend grow from top
//					.attr("y","0")					
					.attr("x",function(e) {
						var x;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							x = i*(g.lgn.txtOff + g.lgn.txtWidth) + g.lgn.txtOff;
						}
						else {
							x = g.lgn.txtOff;
						}
						return x;
					})
					.attr("y",function(e) { 
						var y;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							y = g.lgn.pad + 11;
						}
						else {
							y = g.lgn.pad + g.lgn.itmHeight*i + 11;
						}
						return y;
					})
					.style("opacity","0")
					.text(function(e) { 
						return e;
					})
				;
			})
			;
	}
},

/**
 *--------------------------------------
 * Update Bars
 *--------------------------------------
 * Modify properties of bars, deltas, and legend
*/
updateBars: function() {

	var g = this;

	var dim1 = g.data.map(function(d) { return d.dim1; });
	if (g.orientation == "H") dim1.reverse()
	g.dScale.domain(dim1);
	g.mScale.domain( [0, d3.max(g.data, function(d) { return (g.normalized ? 1 : d.total)*g.gridHeight; })]);
	var tDelay = g.transitions && !g.editMode ? g.transitionDelay : 0;
	var tDuration = g.transitions && !g.editMode ? g.transitionDuration : 0;

	// Procedure to update dimension and measure axes
	var updateAxis = function (labelTitle, labelStyle, axis, axisClass, isXAxis, axisWidth) {

		if (labelTitle == 'B' || labelTitle == 'L') {
			// Update axis with transition
			g.svg.select("#" + g.id + " ." + axisClass + ".ldwaxis")
				.transition()
				.delay(tDelay)
				.duration(tDuration)
				.ease(g.ease)
				.call(axis)
				;
			var lbl = d3.selectAll("#" + g.id + " ." + axisClass + ".ldwaxis");
			var txt = lbl.selectAll(".tick.major text")
				.attr("transform",null); // All horizontal initially
			var maxWidth = isXAxis ? lbl.node().getBBox().width/txt[0].length : g.yAxisWidth - 5;

			// If auto labels and any overlap, set to tilted
			if (labelStyle == "A") {
				txt.each(function(d, i) {
						if (d3.select(this).node().getComputedTextLength() > maxWidth) {
							labelStyle = "T"  // no break for each
						}
					})
					;
			}
			// Tilted labels
			if (labelStyle == "T") {
				txt.style("text-anchor","end")
					.attr("transform","translate(" + (isXAxis ? "-12,0" : "-2,-8") + ") rotate(-45)")
					;
				maxWidth = isXAxis ? g.xAxisHeight - 5 : maxWidth * Math.sqrt(2);
			}
			// Staggered labels
			else if (labelStyle == "S" && isXAxis) {
				txt.each(function(d, i) {
						if (i % 2 == 1) {
							d3.select(this).attr("transform","translate(0,14)");
						}
					})
					;
			}
			// Horizontal or titled labels, use ellipsis if overlap
			if (labelStyle == "H" || labelStyle == "T") {
				txt.each(function(d, i) {
						var self = d3.select(this),
							textLength = self.node().getComputedTextLength(),
							text = self.text();
						while (textLength > maxWidth && text.length > 0) {
							text = text.slice(0, -1);
							self.text(text + '\u2026');
							textLength = self.node().getComputedTextLength();
						}
					});
			}
		}
	};
	// Update dimension axis
	updateAxis(g.labelTitleD, g.labelStyleD, g.dAxis, "ldw-d", g.orientation == "V");
	// Update measure axis
	updateAxis(g.labelTitleM, g.labelStyleM, g.mAxis, "ldw-m", g.orientation != "V");
	
	g.bars = g.svg.selectAll("#" + g.id + " .ldwbar")
		.data(g.flatData, function(d) { return d.dim1 + '|' + d.dim2; } )
		;
	// Remove bars with transition
	g.bars
		.exit()
		.transition()
		.delay(tDelay)
		.duration(tDuration)
		.ease(g.ease)
		.style("opacity", "0")
		.remove()
		;
	if (g.showDeltas && g.nDims == 2) {			
		g.polys = g.svg.selectAll("#" + g.id + " polygon")
			.data(g.deltas, function(d) { return d.dim1p + "-" + d.dim1c + "," + d.dim2; } )
			;
		// Remove deltas with transition
		g.polys
			.exit()
			.transition()
			.delay(tDelay)
			.duration(tDuration)
			.ease(g.ease)
			.style("opacity", "0")
			.remove()
			;
	}
	// remove legend items with transition
	if (g.lgn.use) {
		g.lgn.items = d3.selectAll("#" + g.id + " .ldwlgnitems")
			.selectAll("g")
			.data(g.allDim2, function(d) { return d; })
			;
		g.lgn.items
			.exit()
			.transition()
			.delay(tDelay)
			.duration(tDuration)
			.ease(g.ease)
			.style("opacity", "0")
			.remove()
			;
	}
	
	// Add any new bars/deltas/legend items
	this.createBars();

	// Update bars
	if (g.orientation == "V") {
		g.bars.transition()
			.delay(tDelay)
			.duration(tDuration)
			.ease(g.ease)
			.style("opacity","1")
			.attr("x", function(d, i) {
				return g.dScale(d.dim1) ? g.dScale(d.dim1) : 0; // ignore NaN: causing errors in transitions
			})
			.attr("y", function(d) {
				return g.mScale(d.offset) - (g.mScale(0) - g.mScale(d.qNum));
			})
			.attr("width", g.dScale.rangeBand() && g.dScale.rangeBand() > 0 ? g.dScale.rangeBand() : 0) // ignore NaN: causing errors in transitions
			.attr("height", function(d) {
				return g.mScale(0) > g.mScale(d.qNum) ? g.mScale(0) - g.mScale(d.qNum) : 0;  // ignore negatives: causing errors in transitions
			})
			;
	}
	else {
		g.bars.transition()
			.delay(tDelay)
			.duration(tDuration)
			.ease(g.ease)
			.style("opacity","1")
			.attr("x", function(d) {
				return g.mScale(d.offset);
			})
			.attr("y", function(d, i) {
				return g.dScale(d.dim1);
			})
			.attr("width", function(d) {
				return g.mScale(d.qNum);
			})
			.attr("height", g.dScale.rangeBand())
			;
	}
	
	if (g.showDeltas && g.nDims == 2) {
	
		// update deltas
		g.polys.transition()
			.delay(tDelay)
			.duration(tDuration)
			.ease(g.ease)
			.attr("points",function(d) {
				var p;
				if (g.orientation == "V") {
					p = (g.dScale(d.dim1p)+g.dScale.rangeBand()) + "," +
						(g.mScale(d.points[0]) - (g.mScale(0) - g.mScale(d.points[2]))) + " " +
						
						(g.dScale(d.dim1p)+g.dScale.rangeBand()) + "," +
						g.mScale(d.points[0]) + " " +
						
						(g.dScale(d.dim1c)) + "," +
						g.mScale(d.points[1]) + " " +
						
						(g.dScale(d.dim1c)) + "," +
						(g.mScale(d.points[1]) - (g.mScale(0) - g.mScale(d.points[3])))
					;
				}
				else {
					p =	(g.mScale(d.points[0]) + g.mScale(d.points[2])) + "," +
						(g.dScale(d.dim1p) + g.dScale.rangeBand()) + " " +
						
						g.mScale(d.points[0]) + "," +
						(g.dScale(d.dim1p) + g.dScale.rangeBand()) + " " +
						
						g.mScale(d.points[1]) + "," +
						g.dScale(d.dim1c) + " " +
						
						(g.mScale(d.points[1]) + g.mScale(d.points[3])) + "," +
						g.dScale(d.dim1c)
					;
				}
				return p;
			})
			.style("fill",function(d) {
				return g.cScale(d.dim2);
			})
			.style("opacity",g.barGap == 1 ? "1" : "0.5")
			;
	}
	// update legend items
	if (g.lgn.use) {
		
		if (g.lgn.use == "T" || g.lgn.use == "B") {
			var maxprow = Math.floor(g.lgn.width/(g.lgn.txtOff + g.lgn.txtWidth));
			var nprow = maxprow;
		}
	
		g.lgn.items
 			.each(function(d, i) {
				d3.select(this)
					.transition()
					.delay(tDelay)
					.duration(tDuration)
					.select("rect")
					.attr("x",function(e) {
						var x;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							x = (i % nprow)*(g.lgn.txtOff + g.lgn.txtWidth);
						}
						else {
							x = g.lgn.pad;
						}
						return x;
					})
					.attr("y",function(e) { 
						var y;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							y = g.lgn.pad + Math.floor(i/nprow) * g.lgn.itmHeight;
						}
						else {
							y = g.lgn.pad + g.lgn.itmHeight*i;
						}
						return y;
					})
					.style("opacity","1")
				;
				var txt = d3.select(this)
					.transition()
					.delay(tDelay)
					.duration(tDuration)
					.select("text")
					.attr("x",function(e) {
						var x;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							x = (i % nprow)*(g.lgn.txtOff + g.lgn.txtWidth) + g.lgn.txtOff;
						}
						else {
							x = g.lgn.txtOff;
						}
						return x;
					})
					.attr("y",function(e) { 
						var y;
						if (g.lgn.use == "T" || g.lgn.use == "B") {
							y = g.lgn.pad + Math.floor(i/nprow) * g.lgn.itmHeight + 11;
						}
						else {
							y = g.lgn.pad + g.lgn.itmHeight*i + 11;
						}
						return y;
					})
					.style("opacity","1")
					;
				txt.each(function(d, i) {
						var self = d3.select(this),
							textLength = self.node().getComputedTextLength(),
							text = self.text();
						while (textLength > g.lgn.txtWidth && text.length > 0) {
							text = text.slice(0, -1);
							self.text(text + '\u2026');
							textLength = self.node().getComputedTextLength();
						}
					});
				;
			})
			;
	}
},

/**
 *--------------------------------------
 * Refresh chart
 *--------------------------------------
 * Refresh chart, no new data
*/
refreshChart: function() {
	
	this.initChart();
	this.createBars();
	this.updateBars();
},
//--------------------------------------
// Topological sort
//--------------------------------------
/*- begin https://github.com/marcelklehr/toposort */
toposort: function(nodes, edges) {
	  var cursor = nodes.length
		, sorted = new Array(cursor)
		, visited = {}
		, i = cursor

	  while (i--) {
		if (!visited[i]) visit(nodes[i], i, [])
	  }

	  return sorted

	  function visit(node, i, predecessors) {
		if(predecessors.indexOf(node) >= 0) {
		  throw new Error('Cyclic dependency: '+JSON.stringify(node))
		}

//		if (!~nodes.indexOf(node)) {
//		  throw new Error('Found unknown node. Make sure to provided all involved nodes. Unknown node: '+JSON.stringify(node))
//		}

		if (visited[i]) return;
		visited[i] = true

		// outgoing edges
		var outgoing = edges.filter(function(edge){
		  return edge[0] === node
		})
		if (i = outgoing.length) {
		  var preds = predecessors.concat(node)
		  do {
			var child = outgoing[--i][1]
			visit(child, nodes.indexOf(child), preds)
		  } while (i)
		}

		sorted[--cursor] = node
	}
},
/*- end https://github.com/marcelklehr/toposort */

//--------------------------------------
// Color Schemes
//--------------------------------------
custom100: [
"#99c867","#e43cd0","#e2402a","#66a8db","#3f1a20","#e5aa87","#3c6b59","#aa2a6b","#e9b02e","#7864dd",
"#65e93c","#5ce4ba","#d0e0da","#d796dd","#64487b","#e4e72b","#6f7330","#932834","#ae6c7d","#986717",
"#e3cb70","#408c1d","#dd325f","#533d1c","#2a3c54","#db7127","#72e3e2","#e2c1da","#d47555","#7d7f81",
"#54ae9b","#e9daa6","#3a8855","#5be66e","#ab39a4","#a6e332","#6c469d","#e39e51","#4f1c42","#273c1c",
"#aa972e","#8bb32a","#bdeca5","#63ec9b","#9c3519","#aaa484","#72256d","#4d749f","#9884df","#e590b8",
"#44b62b","#ad5792","#c65dea","#e670ca","#e38783","#29312d","#6a2c1e","#d7b1aa","#b1e7c3","#cdc134",
"#9ee764","#56b8ce","#2c6323","#65464a","#b1cfea","#3c7481","#3a4e96","#6493e1","#db5656","#747259",
"#bbabe4","#e33f92","#d0607d","#759f79","#9d6b5e","#8574ae","#7e304c","#ad8fac","#4b77de","#647e17",
"#b9c379","#8da8b0","#b972d9","#786279","#7ec07d","#916436","#2d274f","#dce680","#759748","#dae65a",
"#459c49","#b7934a","#51c671","#9ead3f","#969a5c","#b9976a","#46531a","#c0f084","#76c146","#bad0ad"
],
google20: [
"#3366cc","#dc3912","#ff9900","#109618","#990099","#0099c6","#dd4477","#66aa00","#b82e2e","#316395",
"#994499","#22aa99","#aaaa11","#6633cc","#e67300","#8b0707","#651067","#329262","#5574a6","#3b3eac"
],
qlikView18: [
"#8daacb","#fc7362","#bbd854","#ffd92f","#66c296","#e5b694","#e78ad2","#b3b3b3","#a6d8e3","#abe9bc",
"#1b7d9c","#ffbfc9","#4da741","#c4b2d6","#b22424","#00acac","#be6c2c","#695496"
],
qlikSense12: [
"#332288","#6699cc","#88ccee","#44aa99","#117733","#999933","#ddcc77","#661100","#cc6677","#aa4466",
"#882255","#aa4499"
]
}