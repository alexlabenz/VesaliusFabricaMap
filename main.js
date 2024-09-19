/*guide from https://mappingwithd3.com/tutorials/basics/projections/ and https://stackoverflow.com/questions/18425440/displaying-map-using-d3-js-and-geojson
-largely cannibalized from my own undergrad d3 projects, although mapping components are newly learned

*/
let dataTest;
let coords;

document.addEventListener('DOMContentLoaded', function () {
     
    itemsList=[];

    Promise.all([d3.csv('../VesaliusFabricaMap/data/test.csv'),d3.csv('../VesaliusFabricaMap/data/coords_map.csv')])
        .then(function (values) {
            data=values[0];
            coords=values[1];

            coords.forEach(d => {
                d.Latitude=+d.Latitude;
                d.Longitude=+d.Longitude;
            })

            //current code for only showing earliest entry for each city
            data.forEach(d => {
                rowTemp=coords.find(row => d.City==row.City);
                if (typeof rowTemp != 'undefined'){
                    itemsList.push({Year: +d.Year,City: d.City,Identity: d.Identity,Title: parse(d.Title),Latitude: rowTemp.Latitude,Longitude: rowTemp.Longitude});
                }
            })

            itemsList=itemsList.sort(function(a,b){
                if(a.Year<b.Year){
                    return 1;
                }
                if(a.Year>b.Year){
                    return -1;
                }
            })

            //----------------------------------------------------------
            //code for future expansion with all entries for each city
            //----------------------------------------------------------
            // data.forEach(d => {
            //     rowTemp=coords.find(row => d.City==row.City);
            //     if (typeof rowTemp != 'undefined'){
            //         if (typeof itemsList.find(row => rowTemp.City==row.City)=='undefined'){
            //            itemsList.push({City: rowTemp.City, Longitude: rowTemp.Latitude, Latitude: rowTemp.Longitude, Books: []});
            //         }
            //         itemsList.find(row => d.City==row.City).Books.push({Year: +d.Year,Identity: d.Identity,Title: parse(d.Title)});
            //     }
            // })

            // for(var i=0;i<itemsList.length;i++){
            //     itemsList[i].Books.sort(function(a,b){
            //         if(a.Year>b.Year){
            //             return 1;
            //         }
            //         if(a.Year<b.Year){
            //             return -1;
            //         }
            //     })
            // }

            dataTest=itemsList;

            console.log(coords);
            console.log(dataTest);



            drawChart();
            

    });
 });

 function parse(s){
    var n='';
    n=s.replace(/[^0-9a-zA-Z_\s+]/g,'');
    return n;
 }

function drawChart(){
    const svg=d3.select('#testSvg')
        .style('background','slateblue')
    const width = +svg.style('width').replace('px','');
    const height = +svg.style('height').replace('px','');
    const margin = { top:50, bottom: 50, right: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    var tip=d3.select('#my_dataviz')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity',0)
        .style('left','0px')
        .style('top','0px');

    const yearLabel = tip.append('div').attr('class', 'ps-2')
        .text('no item selected');
    const cityLabel=tip.append('div').attr('class', 'ps-2')
        .text('_');

    

    svg.selectAll('g').remove();

    const colorYear=d3.scaleLinear()
        .domain(d3.extent(dataTest, function(d) {return d.Year;}))
        .range(['darkgrey','red']);

    // svg.append('svg');

    var projection=d3.geoMercator()
        .scale(Math.min(innerWidth,innerHeight)*2.7)
        .center([7.588576,47.559601])
        .translate([innerWidth/1.5,innerHeight/1.5])


    var path=d3.geoPath()
        .projection(projection);


    d3.json('../VesaliusFabricaMap/data/world.geo.json').then(function(json) { //json from https://geojson-maps.ash.ms/
        svg.selectAll('g')
            .data(json.features)
            .join("path")
                .attr("d", path)
                .style('stroke','tan')
                .style('fill','ivory');
        svg.selectAll('g')
            .data(dataTest)
            .enter()
            .append('circle')
            .attr('cx', d => projection([d.Longitude, d.Latitude])[0])
            .attr('cy', d => projection([d.Longitude, d.Latitude])[1])
            // .attr('cx', d => projection([d.find(row => d.City==row.City).Longitude,coords.find(row => d.City==row.City).Latitude])[0])
            // .attr('cy', d => projection([coords.find(row => d.City==row.City).Longitude,coords.find(row => d.City==row.City).Latitude])[1])
            .attr('r', '5')
            .attr('fill', d => color_year(d))


            .on('mouseover', function(d,i){
                // console.log('d=',d);
                console.log('d=',d);
                console.log(i);
                var mouseX=d.layerX;
                var mouseY=d.layerY;
                // svg.selectAll('circle')
                //     .style('opacity',.5)
                // svg.selectAll(`#${i.Title}`)
                //     .style('stroke-width',4)
                //     .style('opacity',1)

                tip.transition()
                    .duration(0)
                    .style('opacity', 1)
                    .style('left',(mouseX+10)+'px')
                    .style('top',(mouseY-30)+'px')
                    .style('text','hello')
                yearLabel.text(i.Year)
                cityLabel.text(i.City)

            })
            .on('mouseout', function(d,i){
                // svg.selectAll('circle')
                //     .style('opacity',1)
                // svg.selectAll(`#${i.Title}`)
                //     .style('stroke-width',1)
                
                tip.style('opacity',0)
            })

    }); 

    function color_year(r){
        return colorYear(r.Year)
    }

    //build legend
    const svgDefs=d3.select('#legendarySvg').append('defs') //gradient implementation from https://www.freshconsulting.com/insights/blog/d3-js-gradients-the-easy-way/
        .attr('id', 'mainGradient');
        
    var gradient = svgDefs.append("linearGradient") 
        .attr("id", "legendGradient")
        .attr("x1", "100%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    gradient.append("stop")
        .attr('class', 'start')
        .attr("offset", "0%")
        .attr("stop-color", "red")
        .attr("stop-opacity", 1);
        
    gradient.append("stop")
        .attr('class', 'end')
        .attr("offset", "100%")
        .attr("stop-color", "darkgrey")
        .attr("stop-opacity", 1);

    d3.select('#legendarySvg').append('rect')
        .attr('x',50)
        .attr('y',10)
        .attr('width',innerWidth)
        .attr('height',20)
        .style('fill','url(#legendGradient)');

    //append labels for legend
    d3.select('#legendarySvg').append('text')
        .attr('x',0)
        .attr('y',25)
        .text('1543');
    
    d3.select('#legendarySvg').append('text')
        .attr('x',width-38)
        .attr('y',25)
        .text('1800');
}
