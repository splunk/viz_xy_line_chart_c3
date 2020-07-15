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

                var x_benchmark_value = parseFloat(config[this.getPropertyNamespaceInfo().propertyNamespace + 'x_benchmark_value'])
                var y_benchmark_value = parseFloat(config[this.getPropertyNamespaceInfo().propertyNamespace + 'y_benchmark_value'])
                var x_benchmark_label = config[this.getPropertyNamespaceInfo().propertyNamespace + 'x_benchmark_label']
                var y_benchmark_label = config[this.getPropertyNamespaceInfo().propertyNamespace + 'y_benchmark_label']

                //create a list to store fields names --> use to name header of the tooltip table 
                var fields_names = [];

                //create a hashmap to store info: {key: dataname, val: list(element).sort(by x)} 
                var dict = new Map();

                //create a xs_map object to store info for c3.data.xs
                var new_xs_map = new Map();

                //create a array to store info for c3.data.columns
                var new_d = [];

                if (data["fields"].length > 0) {
                    for (i in data.fields) {
                        field = data.fields[i];
                        if (field["name"]) {
                            fields_names.push(field["name"]);
                        }
                    }
                }

                for (i in data.rows) {
                    row = data.rows[i];
                    if (row["0"] != undefined) {
                        let key = row["0"];
                        //if no key in dict, create a key:list[element]
                        if (!dict.has(key)) {
                            dict.set(key, []);
                        }
                        let element = {};
                        element["x_key"] = key + "_x";
                        element["y_key"] = key;

                        //update the values into element
                        //start from 1, fields_names[0] is data's name
                        for (let j = 1; j < fields_names.length; j++) {
                            let att_name = fields_names[j];
                            // element[att_name] = row[j].replace(/,/g, "");
                            element[att_name] = row[j];
                        }
                        //push the element into list
                        dict.get(key).push(element);
                    }
                }
                // console.log("dict", dict);

                for (let [key, value] of dict) {
                    var x_field = fields_names[1];
                    var y_field = fields_names[2];

                    //sort each list by x_field
                    value.sort((a, b) => a[x_field] - b[x_field]);

                    let x_key = value[0]["x_key"]
                    let y_key = value[0]["y_key"]

                    //construct xm_map
                    new_xs_map[y_key] = x_key

                    //construct columns
                    let col_x = [x_key]
                    let col_y = [y_key]
                    for (let i = 0; i < value.length; i++) {
                        let el = value[i];
                        col_x.push(el[x_field].replace(/,/g, ""));
                        col_y.push(el[y_field].replace(/,/g, ""));
                    }
                    new_d.push(col_x);
                    new_d.push(col_y);
                }

                // Clear the div
                this.$el.empty();
                var path = this.$el;
                var chart = c3.generate({
                    data: {
                        xs: new_xs_map,
                        columns: new_d,
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
                    axis: {
                        x: {
                            label: {
                                text: x_field,
                                position: 'outer-center'
                            }
                        },
                        y: {
                            label: {
                                text: y_field,
                                position: 'outer-middle'
                            }
                        }
                    },
                    tooltip: {
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {

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
                                        //construct header of tooltip table
                                        text = "<table class = '" + $$.CLASS.tooltip + "'><tr>"
                                        for (let idx = 0; idx < fields_names.length; idx++) {
                                            let header = sanitise(fields_names[idx]);
                                            text += (header || header === 0 ? "<th colspan='2'>" + header + '</th>' : '');
                                        }
                                        text += "</tr>";

                                    }
                                    // console.log("d", d)
                                    value = sanitise(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));
                                    x = sanitise(valueFormat(d[i].x, d[i].ratio, d[i].id, d[i].index, d));

                                    //leverage id and index to extrac additional fields from dict 
                                    id = sanitise(nameFormat(d[i].id, d[i].ratio, d[i].x, d[i].index, d));
                                    index = sanitise(valueFormat(d[i].index, d[i].ratio, d[i].id, d[i].x, d));

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
                                if (value !== undefined) {
                                    text += "<tr class='" + $$.CLASS.tooltipName + '-' +
                                        $$.getTargetSelectorSuffix(d[i].id) + "'>";
                                    text += "<td class='name' colspan='2'><span style='background-color:" +
                                        bgcolor + "'></span>" + name + '</td>';
                                    text += "<td class='value' colspan='2'>" + x + '</td>';
                                    text += "<td class='value' colspan='2'>" + value + '</td>';

                                    //add additional fields
                                    el_list = dict.get(id);

                                    //additional fileds name start from index 3
                                    for (let j = 3; j < fields_names.length; j++) {
                                        field_name = fields_names[j]
                                        field_value = el_list[index][field_name]
                                        // console.log("field_name", field_name, "field_value", field_value)
                                        text += "<td class='value' colspan='2'>" + field_value + '</td>';
                                    }
                                    text += '</tr>';
                                }
                            }
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
