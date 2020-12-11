<template>

    <v-card-text>
         <v-flex xs12  class="pa-4" style=" text-align: justify; ">
        <div style="margin-bottom: 15px">
            <img style="width: 160px; position: absolute; opacity: 0.2; bottom: 70px; right: 5px;" src="../assets/logo2.png" alt="">
            <span class="title" style="color: #1e2f4d;">Monitoring of crop status</span>
        </div>

        <p>
            Plant stress attributed to diseases and pests is, still, one of the primary issues that olive growers face in olive growing countries. 
            It results in severe yield losses and deterioration of the quality of the final product.
        </p>
        <p>
           The aim of the Crop Monitoring Service is to use satellite remote sensing to regularly monitor large areas 
           of olive fields for incidence of plant stress and coordinate the necessary preventive applications.
        </p>
        <p style="margin-bottom: 15px">
           This is achieved by using vegetation indices derived from Sentinel-2 data to classify a given field into one of two categories “Stressed” or “Not Stressed”.
        </p>        
        <p>
            <span class="title" style="color: #37aa48; font-size 12px;">
            Algorithm Specifications
            </span>
        </p>
        <p>
            The necessary inputs to run the algorithm and apply the classification are the following:
        </p>
        <p style="margin-bottom: 15px">
            <ul>
                <li style="margin-bottom: 10px;">Polygons matching the borders of an olive field (drawn by user)</li>
                <li style="margin-bottom: 10px;">Selection of a time range Sentinel-2 Level 2A product (chosen by user)</li>
                <li style="margin-bottom: 10px;">Selection of the maximum allowed cloud coverage for the Sentinel-2 images of the selected dates (chosen by user)</li>
                <li style="margin-bottom: 10px;">Computation of vegetation indices (as shown below) for each pixel of each drawn polygon, by using sentinel hub’s Feature Info Service (FIS)</li>
                <div style="width: 100%; text-align: center"> <img  src="../assets/table.png" alt=""> </div>
                <li style="margin-bottom: 10px;">Classification of each pixel/field into a “Stressed” or “Not Stressed” category by using a trained machine learning model. </li>
            </ul>
        </p>
        <p>
            <span class="title" style="color: #37aa48; font-size 12px;">
            Output description
            </span>
        </p>
        <p>
            This service provides maps of stress incidence in field level. 
        </p>
        <p>
            The user is able to view via pop-up windows the vegetation index values and classification results for each pixel in the drawn polygon.
        </p>       
        <p>
            The user can download a .geoTIFF or WMS layer of the drawn polygons and a .csv containing the values of the vegetation indices for each polygon.
        </p>   
        <p>
           The service can be repeated every 5 days that a new satellite image is acquired.
        </p>     
        <p>
           Using these maps farmers and agronomists will be able to be more efficient in the detection and treatment of stressed fields.
        </p>   
        <p>
          Future steps for this service include classification of higher accuracy and identification of specific pathogen types, that can be achieved by implementing UAV-enabled hyperspectral imagery correlated to ground truth.
        </p>                    
                          
    </v-flex>
    </v-card-text>

</template>

<script>
export default {
  name: "StartDialog",  
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
