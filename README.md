# barsPlus
Add another "dimension" to your dashboard with *transitions*.  Transitions show the user how the data changes with different selections. Chart elements will slowly morph into new chart, giving the user extra information about how the selections have affected the chart.

barsPlus is a single extension that allows creating bar charts (horizontal and vertical), stacked bar charts, 100% stacked bar charts, stacked bars showing changes, and area charts.

![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stacked100pctChange.gif "barsPlus 100% bar chart with transitions")

## Features

* regular and stacked bar charts (1 or 2 dimensions)
* stacked bars can be normalized (100% bars for percent contribution)
* horizontal or vertical bars
* area charts (standard or 100%)
* transitions
* bar connectors (skewed blocks between bar segments showing change)
* legends
* tooltips
* standard and quick selections
* multiple options available for fine tuning appearance

## Installation

* Download the entire barsPlus github project folder as a zip file
* Unzip the project folder into the Qlik Sense Extensions folder ([my documents]\Qlik\Sense\Extensions)

## Chart Examples

![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/simpleBar.gif "barsPlus simple bar chart")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stackedBar.png "barsPlus stacked bar chart")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stackedBar2.png "barsPlus stacked bar chart")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stackedBarChanges4.png "barsPlus stacked bar chart with changes")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stackedDesc.gif "barsPlus stacked bars descending order")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stackedBarChanges.png "barsPlus stacked bar chart with changes")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stackedBarChanges2.png "barsPlus stacked bar chart with changes")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/simpleBar6.gif "barsPlus minimal simple bars")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/area100pctChange.gif "barsPlus area chart")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/areaChart.png "barsPlus area chart")
![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/stacked100pctBarChangesTooltip.png "barsPlus 100% with changes")

## Usage

### Basic chart with defaults

1.  Drag the extension to a Qlik Sense sheet.
2.  Add one dimension for a simple bar chart or two dimensions for the other types of charts.  The first dimension is the dimension axis.  The label for the first dimension becomes the dimension axis label.
3.  Select a single measure.  The label for the measure becomes the measure axis label.
4.  Make sure the dimension settings in the properties panel have "Show null values" unchecked.
5.  **Important:** set the sort order, sort by dimensions first, measure last.
    * to create a stacked bar chart which is ordered by the measure value, set the sort order for the primary dimension to be an expression, e.g. =SUM(Measure), ascending or descending.
6.  Generally you should exclude zero values for the measure using "Add-ons" -> "Data Handling" -> clear "show zero values"

### Quick Start for Various Chart Types

**Simple bar** - one dimension, one measure

**Stacked bar** - two dimensions, one measure, axis dimension comes first, sort dimensions first

**100% stacked bar** - two dimensions, one measure, axis dimension comes first, sort dimensions first
* Appearance -> Presentation -> 100% Bars = on
* Appearance -> Presentation -> Grid height relative to max bar = 1

**100% stacked bar showing connectors** - two dimensions, one measure, axis dimension comes first, sort dimensions first
* Appearance -> Presentation -> 100% Bars = on
* Appearance -> Presentation -> Bars with connectors = on
* Appearance -> Presentation -> Grid height relative to max bar = 1
* Appearance -> Presentation -> Bar spacing = 0.5
* Appearance -> Presentation -> Outer Bar spacing = 0

**Area chart** - two dimensions, one measure, axis dimension comes first, sort dimensions first
* Appearance -> Presentation -> Bars with connectors = on
* Appearance -> Presentation -> Bar spacing = 1
* Appearance -> Presentation -> Outer Bar spacing = 0

**100% Area chart** - two dimensions, one measure, axis dimension comes first, sort dimensions first
* Appearance -> Presentation -> 100% Bars = on
* Appearance -> Presentation -> Bars with connectors = on
* Appearance -> Presentation -> Bar spacing = 1
* Appearance -> Presentation -> Outer Bar spacing = 0
* Appearance -> Presentation -> Grid height relative to max bar = 1

### Property Panel

#### Add-ons -> Selection mode

* You can set the selection mode in "Add-ons" -> "Selection mode"
  * **Standard**: this is the default Qlik Sense selection mode where you can preview multiple selections.
  * **Quick**: this is similar to QlikView classic selection mode where the selection is immediately applied.

#### Appearance -> Presentation

* **Orientation**: change the bar format: horizontal or vertical

* **100% bar chart**: choose "100% bars" to make the stacked bars all the same height with the segments within each bar representing a portion of the total (like a pie-chart in bar format).  When this is selected, you should also set "Grid height relative to max bar" to 1.

* **Bars with connectors**: connectors are the skewed blocks that join segments in adjacent bars in a stacked bar chart.  These give an indication of how the segments change.  The connectors also have tooltips to show the numerical value of the change.

* **Bar spacing**: this controls the gap between bars. A value of 0 (no gap) is appropriate for a histogram, while a value of 1 is used to create an area chart.

* **Outer bar spacing** is the spacing before the first bar and after the last bar.  Set this to 0 to remove all spacing.

* **Grid height relative to max bar** generally the highest bar in a bar chart does not touch the top of the chart, so the grid is bigger than the highest bar.  Set this number to a value greater than one to provide space between the highest bar and the top of the chart.  Set this to 0 to allow bars to touch the top.  This should be set to 0 for 100% charts.

* **Background color** you can set the background color for the grid by entering a single color.  This can be a javascript color name: (white, gray, azure), a hex code (e.g. #d0d0d0, #f8f8f8), or rgb specifier: rgb(230,250,250).

#### Appearance -> Colors and Legend

* **Color scheme**: select one of the predefined color schemes.  Unless an offset is specified (see below), the colors are assigned sequentially starting at the beginning.

  * category10, category20, category20b, category20c: standard D3 color schemes
  
  * google20: bright color scheme
  
  * custom100: lifted from Qlik Sense theme file
  
  * qlikView18: QlikView classic colors
  
  * qlikSense12: Qlik Sense default colors

* **Start offset in color scheme**.  In order to specify a different starting color in the color scheme, enter a number here from 0 to (number of colors) - 1.  The number of colors in a color scheme is shown in the name of the color scheme, e.g. category10 has 10 colors so the offset can be from 0 to 9.  Note that when necessary the colors are reused in a revolving fashion.

* **Show legend** indicates whether a legend is to be shown.

* **Legend position** specifies the position of the legend: Right, Left, Top, or Bottom.

* **Legend size** allows you to adjust the size (width for right/left legends or height for top/bottom legends).  Choose narrow, medium or wide.

* **Legend spacing** is only applicable to top or bottom legends and it controls spacing between the individual legend items.

#### Appearance -> X-Axis

*Note that the x-axis may be either the dimension or the measure axis, depending on the chart orientation.  Information here describes the dimension axis*

* **Labels and title** whether to show "Labels and title", "Labels only", "Title only", or "None".  Title is the single name for an axis appearing in the center.  Labels are the ticks, numbers/descriptions, gridlines.

* **Label Style:**: "Auto", "Horizontal", "Staggered", "Tilted".  Auto means a horizontal label will be used unless there is not enough space, in which case the labels will be tilted 45 degrees.

* **Gridlines** controls whether gridlines can span the length or height of the chart.  Gridlines cannot be shown when labels have been suppressed.

* **Dimension margin size** refers to the width/height of the labels and axis excluding the axis title.  Select Narrow, Medium or Wide.

#### Appearance -> Y-Axis

*Note that the y-axis may be either the dimension or the measure axis, depending on the chart orientation.  Information here describes the measure axis*

* **Labels and title** whether to show "Labels and title", "Labels only", "Title only", or "None".  Title is the single name for an axis appearing in the center.  Labels are the ticks, numbers/descriptions, gridlines.

* **Label Style:**: "Auto", "Horizontal", "Staggered", "Tilted".  Auto means a horizontal label will be used unless there is not enough space, in which case the labels will be tilted 45 degrees.

* **Gridlines** controls whether gridlines can span the length or height of the chart.  Gridlines cannot be shown when labels have been suppressed.

* **Measure margin size** refers to the width/height of the labels and axis excluding the axis title.  Select Narrow, Medium or Wide.

* **Measure tick spacing** controls the number of ticks that appear on the axis.  Wide has few ticks while Narrow has more.

* **Measure axis number format**: since it's not clear how to format numbers using Qlik Sense format strings from an extension, the native D3 number formatting is used on the measure axis. Choose the basic format from the dropdown or specify "Custom" to enter a D3 format string.  Format strings are described here: 
*[D3 Format Description](https://github.com/d3/d3-3.x-api-reference/blob/master/Formatting.md "D3 format strings")*

#### Appearance -> Transitions

* **Transitions enabled** allows you to enable or disable transitions

* **Transition duration** refers to how long the transition takes to complete.  Specify the number of milliseconds (1000 = 1 second).

* **Transition style**: you may change the way transitions appear using one of the standard D3 transition styles, for example, "linear" means there is a uniform speed throughout the transition while "exponential" means the transition is very slow at first and then very fast.

Need I say that the "bounce" style should not be used in production applications? :smile:

## Changing Defaults

If you would like to change any default settings, just make the appropriate change to **barsPlus-props.js**.

## Example Qlik Sense Application

See the Qlik Sense application **BarsPlus.qvf** in the **app** folder for the examples shown on this page.

## Test Program

A standalone AngularJS application has been created to allow seeing the effect of various parameter changes quickly.  Just double-click on the file **barsPlus-test.html** in the extension folder.  This has test data sets and form elements to change parameters.  The buttons at the top will reduce the data set or resize the control.

![alt text](https://github.com/LarryWoodside/barsPlus/blob/master/screenshots/testProgram.png "barsPlus Test Application")

## Any Issues?

Please let me know about any bugs and I will try to fix them.  I will also be continually enhancing this extension so let me know if there are any requests.  If you have modified the code, please share any improvements with me.

## Known Limitations

* no lasso in standard selections
* it should be possible to create stacked bar charts using one dimension and multiple measures, but this is not yet supported
* there's a QS bug with the clear selections button for standard selections.  Attempted a workaround, but the fix does not work if there were existing selections on the field.  Investigating this issue.
