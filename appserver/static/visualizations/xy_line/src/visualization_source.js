/*
 * Visualization source
 */
define([
    'jquery',
    'underscore',
    'api/SplunkVisualizationBase',
    'api/SplunkVisualizationUtils',
    'd3',
    'c3'
],
    function (
        $,
        _,
        SplunkVisualizationBase,
        vizUtils,
        d3,
        c3
    ) {

        // Extend from SplunkVisualizationBase
        return SplunkVisualizationBase.extend({

            initialize: function () {
                SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
                this.$el = $(this.el);

                // Initialization logic goes here
            },

            // Optionally implement to format data returned from search. 
            // The returned object will be passed to updateView as 'data'
            formatData: function (data) {

                // Format data 

                return data;
            },

            // Implement updateView to render a visualization.
            //  'data' will be the data object returned from formatData or from the search
            //  'config' will be the configuration property object
            updateView: function (data, config) {

                // Draw something here
                // Guard for empty data
                if (data.rows.length < 1) {
                    return;
                }
                // console.log("data", data)
                // console.log("config", config)
                // console.log(this.getPropertyNamespaceInfo().propertyNamespace)
                // console.log(config["display.visualizations.custom.viz_xy_line_chart_c3.xy_line.x_benchmark_value"])
                var x_benchmark_value = parseFloat(config[this.getPropertyNamespaceInfo().propertyNamespace + 'x_benchmark_value'])
                var y_benchmark_value = parseFloat(config[this.getPropertyNamespaceInfo().propertyNamespace + 'y_benchmark_value'])
                var x_benchmark_label = config[this.getPropertyNamespaceInfo().propertyNamespace + 'x_benchmark_label']
                var y_benchmark_label = config[this.getPropertyNamespaceInfo().propertyNamespace + 'y_benchmark_label']
                var tooltip_table_h1 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'tooltip_table_h1']
                var tooltip_table_h2 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'tooltip_table_h2']
                var tooltip_table_h3 = config[this.getPropertyNamespaceInfo().propertyNamespace + 'tooltip_table_h3']

                // console.log("x_benchmark_value", x_benchmark_value)
                // console.log("y_benchmark_value", y_benchmark_value)

                console.log("data", data)
                //create a array to store info for c3.data.columns
                var d = []
                //create a xs_map object to store info for c3.data.xs
                var xs_map = {};
                //create a hashmap to store x, y info (label, and vaules) for all datasets
                var util_dict = new Map();

                for (i in data.rows) {
                    row = data.rows[i];
                    if (row["0"] != undefined) {
                        let key = row["0"];
                        if (!util_dict.has(key)) {
                            //create a object to store x, y info (label, and vaules) for each dataset
                            var el = {}
                            el["x_key"] = key + "_x"
                            el["y_key"] = key
                            el["x_values"] = [key + "_x"]
                            el["y_values"] = [key]
                            util_dict.set(key, el)
                            // console.log("util_dict", util_dict)
                        }
                        util_dict.get(key)["x_values"].push(row["1"].replace(/,/g, ""))
                        util_dict.get(key)["y_values"].push(row["2"].replace(/,/g, ""))
                    }
                }
                console.log("final util_dict", util_dict)

                //push the requied info fron util_dict intot d and xs_map
                for (let key of util_dict.keys()) {
                    console.log("key", key)
                    let el = util_dict.get(key)
                    console.log("el", el)
                    xs_map[el["y_key"]] = el["x_key"]
                    d.push(el["x_values"])
                    d.push(el["y_values"])
                }

                console.log("xs_map", xs_map);
                console.log("d", d);

                // Clear the div
                this.$el.empty();
                var path = this.$el;
                var chart = c3.generate({
                    data: {
                        xs: xs_map,
                        columns: d,
                        type: 'line'
                    },
                    grid: {
                        x: {
                            show: true,
                            lines: [{
                                value: x_benchmark_value,
                                text: x_benchmark_label + ' x = ' + x_benchmark_value,
                                position: 'start'
                            }]
                        },
                        y: {
                            show: true,
                            lines: [{
                                value: y_benchmark_value,
                                text: y_benchmark_label + ' y = ' + y_benchmark_value,
                                position: 'start'
                            }]
                        }
                    },
                    tooltip: {
                        // show: false
                        // contents: tooltip
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            console.log("Tooltip Start")
                            var $$ = this,
                                config = $$.config,
                                titleFormat = config.tooltip_format_title || defaultTitleFormat,
                                nameFormat = config.tooltip_format_name || function (name) {
                                    return name;
                                },
                                text,
                                i,
                                title,
                                value,
                                name,
                                bgcolor;
                            console.log("config", config)

                            var sanitise = function sanitise(str) {
                                return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') :
                                    str;
                            };

                            var valueFormat = config.tooltip_format_value;

                            if (!valueFormat) {
                                valueFormat = $$.isTargetNormalized(d.id) ? function (v, ratio) {
                                    return "".concat((ratio * 100).toFixed(2), "%");
                                } : defaultValueFormat;
                            }

                            var tooltipSortFunction = this.getTooltipSortFunction();

                            if (tooltipSortFunction) {
                                d.sort(tooltipSortFunction);
                            }
                            console.log("data", d)
                            for (i = 0; i < d.length; i++) {
                                if (!(d[i] && (d[i].value || d[i].value === 0))) {
                                    continue;
                                }
                                if ($$.isStanfordGraphType()) {
                                    // Custom tooltip for stanford plots 
                                    if (!text) {
                                        title = $$.getStanfordTooltipTitle(d[i]);
                                        text = "<table class='" + $$.CLASS.tooltip + "'>" + title;
                                    }
                                    bgcolor = $$.getStanfordPointColor(d[i]);
                                    name = sanitise(config.data_epochs); // Epochs key name
                                    value = d[i].epochs;
                                } else {
                                    // Regular tooltip 
                                    if (!text) {
                                        // title=sanitise(titleFormat ? titleFormat(d[i].x, d[i].index): d[i].x);
                                        // h1 = sanitise("Series");
                                        // h2 = sanitise("x field");
                                        // h3 = sanitise("y field");
                                        h1 = sanitise(tooltip_table_h1);
                                        h2 = sanitise(tooltip_table_h2);
                                        h3 = sanitise(tooltip_table_h3);
                                        console.log("h1 ", h1);
                                        console.log(titleFormat(d[i].x, d[i].index));
                                        text = "<table class = '" + $$.CLASS.tooltip + "'><tr>" + (h1 || h1 === 0 ?
                                            "<th colspan='2'>" + h1 + '</th>' : '');
                                        text += (h2 || h2 === 0 ? "<th colspan='2'>" + h2 + '</th>' : '');
                                        text += (h3 || h3 === 0 ? "<th colspan='2'>" + h3 + '</th>' : '');
                                        text += "</tr>";
                                        console.log("text", text);
                                    }
                                    value = sanitise(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));
                                    x = sanitise(valueFormat(d[i].x, d[i].ratio, d[i].id, d[i].index, d));
                                    console.log("value", value);
                                    console.log("x", x);
                                    if (value !== undefined && x !==
                                        undefined) {
                                        // Skip elements when their name is set to null
                                        if (d[i].name === null) {
                                            continue;
                                        }
                                        name = sanitise(nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index));
                                        bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);
                                    }
                                }
                                console.log("$$.CLASS.tooltipName", $$.CLASS.tooltipName);
                                if (value !== undefined) {
                                    text += "<tr class='" + $$.CLASS.tooltipName + '-' +
                                        $$.getTargetSelectorSuffix(d[i].id) + "'>";
                                    text += "<td class='name' colspan='2'><span style='background-color:" +
                                        bgcolor + "'></span>" + name + '</td>';
                                    text += "<td class='value' colspan='2'>" + x + '</td>';
                                    text += "<td class='value' colspan='2'>" + value + '</td>';
                                    text += '</tr>';
                                }
                                console.log("text2", text)
                                console.log("x_benchmark_value", x_benchmark_value)
                            }
                            console.log("final text", text)
                            return text + '</table>';
                        }
                    }
                });
                this.$el.append(chart.element);

            },

            // Search data params
            getInitialDataParams: function () {
                return ({
                    outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                    count: 10000
                });
            },

            // Override to respond to re-sizing events
            reflow: function () { }
        });
    });
