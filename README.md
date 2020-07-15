# XY Line Chart - Custom Visualization

> This is a Custom Visualization for Multiple XY Line Chart by leveraging C3.js

### Supported Search command 
    ... | table <data_name_field> <x_field> <y_field> <additional_fields_list>
- `<data_name_field>` (__required__) : The name of the field for the variable that contains the **data's name**.
- `<x_field>` (__required__) : The name of the field for the variable that you want to put in **x-axis**.
- `<y_field>` (__required__) : The name of the field for the variable that you want to put in **y-axis**.
- `<additional_fields_list>` (__optional__) : The names of the fields for the variables that you want to be displayed in the tooltip table (mouseover table). (if more than one fields, separate them by space)

**Note: The order of `<data_name_field>` `<x_field>` `<y_field>` cannot be changed**

### Format Options
- `X Benchmark Vaule` : Set the value for the `x=val` benchmark line.
- `Y Benchmark Vaule` : Set the value for the `y=val` benchmark line.
- `X benchmark Label` : Set the label for the `x=val` benchmark line.
- `Y benchmark Label` : Set the label for the `y=val` benchmark line.

**Tested for Splunk 8.0.2, 8.0.3, 8.0.4.**

> Built by Splunk's FDSE Team (#team-fdse).