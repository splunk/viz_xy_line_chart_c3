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