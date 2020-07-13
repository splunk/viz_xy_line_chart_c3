# XY Line Chart - Custom Visualization

> This is a Custom Visualization for Multiple XY Line Chart by leveraging C3.js

### Supported Search command 
    ... | table <data_name_field> <x_field> <y_field>
- `<data_name_field>` : The name of the field for the variable that contains the **data's name**.
- `<x_field>` : The name of the field for the variable that you want to put in **x-axis**.
- `<y_field>` : The name of the field for the variable that you want to put in **y-axis**.
### Format Options
- `X Benchmark Vaule` : Set the value for the `x=val` benchmark line.
- `Y Benchmark Vaule` : Set the value for the `y=val` benchmark line.
- `X benchmark Label` : Set the label for the `x=val` benchmark line.
- `Y benchmark Label` : Set the label for the `y=val` benchmark line.
- `Tooltip Table H1` : Set the label for the first header (`column for data's name field`) in the tooltip table (mouseover table). 
- `Tooltip Table H2` : Set the label for the second header (`column for x field`) in the tooltip table (mouseover table). 
- `Tooltip Table H3` : Set the label for the third header (`column for y field`) in the tooltip table (mouseover table). 

**Tested for Splunk 8.0.2, 8.0.3, 8.0.4.**

### To-dos

 - Add additioanl fileds into tooltip table.

> Built by Splunk's FDSE Team (#team-fdse).