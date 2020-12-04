<template>
    <div>
        <v-layout row wrap class="ml-2">

            <v-flex sm6 xs12 md8 >
                <v-combobox
                    v-model="selectedPolygon"
                    :items="userPolygons.features"
                    item-text="properties.culture"
                    item-value="properties.pk"
                    label="Select a polygon"
                    v-on:change="zoomToPolygon(selectedPolygon.properties.pk)"
                    color="green"
                    :disabled="isOutput"
                ></v-combobox>
            </v-flex>

            <v-flex sm6 xs12 md4 class="pt-3">
                <v-layout row wrap>
                    <v-btn flat icon color="green" v-if="isSelected" :disabled="isDrawing || isOutput"
                        style="margin: 6px 2px; width: 25px;" @click="zoomToPolygon(selectedPolygon.properties.pk)" title="Zoom to polygon">
                        <v-icon>zoom_in</v-icon>
                    </v-btn>
                    <v-btn flat icon color="green" v-if="isSelected" :disabled="isDrawing || isOutput"
                        style="margin: 6px 2px; width: 25px;" @click="dialogDeletePolygon = true" title="Delete selected polygon">
                    <v-icon>delete</v-icon>
                    </v-btn>
                    <v-btn flat icon color="#27304c" :disabled="isOutput" style="margin: 6px 2px; width: 25px;"
                        @click="drawPolygon()" title="Create new polygon">
                        <v-icon>add_circle_outline</v-icon>
                    </v-btn>
                </v-layout>
            </v-flex>
             
        </v-layout> 

      <!------------ New polygon dialog start ------------>
      <v-dialog v-model="dialogAddPolygon" persistent max-width="290">

        <v-card>
          <v-card-title class="headline">
              <img style="width: 120px;" src="../assets/logo_titulo.png" alt="">
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text style="padding-bottom: 0px;">

            <span  style="color: #37aa48; font-size 14px; font-weight: bold; margin-bottom: 10px;">
              Please type a name for the new polygon:
            </span>

            <v-form ref="formNew" style="margin-top: 15px;" lazy-validation>
              <v-layout row wrap>
                <v-flex xs8 offset-xs2>
                  <v-text-field color="#77b942" :counter="15" v-model="newPolygonName"
                    label="Name *" :rules="inputNewRules" required ></v-text-field>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs12 sm12 md12 lg12>
                  <small>* Indicates required field</small>
                </v-flex>
              </v-layout>
            </v-form>

          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small dark round color="#27304c" @click="savePolygon()" title="Save new polygon">
              Save
            </v-btn>
           </v-card-actions>
         </v-card>

      </v-dialog>
      <!------------ New polygon dialog end ------------>

      <!------------ Delete polygon dialog start ------------>
      <v-dialog v-model="dialogDeletePolygon" persistent max-width="290">

        <v-card>
          <v-card-title class="headline">
            <img style="width: 120px;" src="../assets/logo_titulo.png" alt="">
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text style="text-align: center;">
            <span style="color: #37aa48; font-size 14px; font-weight: bold; margin-bottom: 10px;">
              Are you sure to remove the polygon?
            </span><br>
            <span v-if="selectedPolygon.properties">
              {{selectedPolygon.properties.culture}}
            </span>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn small flat color="#27304c" @click="dialogDeletePolygon = false" title="Cancel">
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn small dark round color="#27304c" @click="removePolygon()" title="Delete polygon">
              Ok
            </v-btn>
          </v-card-actions>
        </v-card>

      </v-dialog>
      <!------------ Delete polygon dialog end ------------>

    </div> 
</template>

<script>

import GeoJSON from 'ol/format/GeoJSON';
import {Draw} from 'ol/interaction.js';
import {Fill, Stroke, Style} from 'ol/style.js';

export default {
    name: "UserPolygons",
    props: {},
    data: () => ({
        userPolygons: [],
        polygonBBOX: [],
        // interactionSelect: null,
        isDrawing: false,
        outputGeojson: {},
        isOutput: false,
        selectedPolygon: "",
        isSelected: false,
        newPolygon: {},
        newPolygonName: "New polygon",
        dialogAddPolygon: false,
        inputNewRules: [
            v => ((v || '').length <= 15) && !!v  || ''
        ],
        dialogDeletePolygon: false,
    }),
    watch: {
    },
    methods: {
        initComponent(){
            this.selectedStyle = [
                new Style({
                    stroke: new Stroke({
                        color: 'red',
                        width: 3
                    }),
                    fill: new Fill({
                        color: 'rgba(0, 0, 0, 0)'
                    })
                })
            ]; 
        },
        /**
        * Get all the user polygons and add them to the map
        *
        * @public
        */
        getUserLayers(){  
 
            var url = 'https://geodb-devel.test.euxdat.eu/xalkidiki/'.concat(this.$store.state.user.preferred_username,
                '/fields/epsg/4326/geojson');

            this.$http.get(url).then(response => {
           
                this.getLayerFromMapByName('userPolygonsLayer').getSource().clear();
                this.userPolygons = [];                
                this.userPolygons = response.body;
                this.getLayerFromMapByName('userPolygonsLayer').getSource().addFeatures((new GeoJSON()).readFeatures(response.body))

                }, response => {
                    this.$eventBus.$emit('show-alert', "error", response.statusText);              
            });

        },//getUserLayers
        /**
        * Get the map layer by name and return it as a OL layer object
        *        
        * @param {string} name
        * @return {object}
        * @public
        */
        getLayerFromMapByName(name){
            var layer;
            this.$store.state.map.getLayers().forEach(function(lyr) {
                if(lyr.get('name') === name){
                    layer = lyr;
                }
            });
            return layer;
        },//getLayerFromMapByName        
        /**
        * Zoom to selected polygon and get their BBOX
        *
        * @param {int} pk
        * @public
        */
        zoomToPolygon(pk){

            var self = this;
            var feature;
            var layer = this.getLayerFromMapByName('userPolygonsLayer');
            this.isSelected = true;

            layer.getSource().getFeatures().forEach(function(fea){                
                if(fea.getProperties().pk === pk){
                    self.$store.state.map.getView().fit(fea.getGeometry());                                        
                    feature = fea;
                }else{
                fea.setStyle(self.defaultStyle);
                }
            });

            feature.setStyle(this.selectedStyle)
            this.polygonBBOX = feature.getGeometry().getExtent();

            this.$store.state.selectedPolygon = feature;
            this.$eventBus.$emit('is-selected', true);    

        },//zoomToPolygon

        /**
        * Create a new polygon
        *
        * @public
        */
        drawPolygon(){
            var draw;
            var self = this;
            var layer = this.getLayerFromMapByName('userPolygonsLayer');
            this.isDrawing = true;

            draw = new Draw({
                source: layer.getSource(),
                type: 'Polygon'
            });

            self.$store.state.map.addInteraction(draw);

            draw.on('drawend', function (event) {

                self.polygonBBOX = event.feature.getGeometry().getExtent();
                self.newPolygon = event.feature;
                self.$store.state.map.removeInteraction(draw);
                self.isDrawing = false;
                self.dialogAddPolygon = true;
            });
        }, //drawPolygon
        /**
        * Save polygon in the database
        *
        * @public
        */
        savePolygon(){

        var self = this;
        var url = 'https://geodb-devel.test.euxdat.eu/xalkidiki/'.concat(this.$store.state.user.preferred_username,
            '/fields/add');

        var geoJSON =
            {
            'type': 'FeatureCollection',
            'crs': {
            'type': 'name',
            'properties': {
                'name': 'EPSG:4326'
            }
            },
            'features': [{
            'type': 'Feature',
            'properties': {"culture": self.newPolygonName, "olu_id": 24},
            'geometry': {
                'type': 'Polygon',
                'coordinates': this.newPolygon.getGeometry().getCoordinates()
                }
            }]
            }

        if(this.$refs.formNew.validate()){
            this.$http.post(url, geoJSON).then(response => {
                self.getUserLayers(false);
                self.dialogAddPolygon = false;                
                self.newPolygonName = "New polygon";
                this.$eventBus.$emit('show-alert', "success", response.statusText);
            }, response => {
                this.$eventBus.$emit('show-alert', "error", response.statusText);
            });
        }

        },//savePolygon
        /**
        * Delete the polygon from the DB and remove it from map
        *
        * @public
        */
        removePolygon(){
            var self = this;
            var pk = this.selectedPolygon.properties.pk;
            var lyr = this.getLayerFromMapByName('userPolygonsLayer');
            var url = 'https://geodb-devel.test.euxdat.eu/xalkidiki/'.concat(this.$store.state.user.preferred_username,
                '/fields/', pk, '/delete');

            this.$http.get(url).then(response => {

                lyr.getSource().getFeatures().forEach(function(fea){
                    if(fea.getProperties().pk === pk){
                        lyr.getSource().removeFeature(fea);
                    }
                });

                this.$eventBus.$emit('show-alert', "success", response.statusText);

                self.dialogDeletePolygon = false;
                self.getUserLayers(false);
                self.selectedPolygon = "";                
                self.isSelected = false;
                this.$eventBus.$emit('is-selected', false);

                }, response => {
                this.$eventBus.$emit('show-alert', "error", response.statusText);
            });

        },//removePolygon

    },
    mounted: function(){
       this.getUserLayers();
       this.initComponent();
    },
    created(){
        this.$eventBus.$on('remove-outputRaster', (lyrName)  => {
             this.$store.state.map.removeLayer(this.getLayerFromMapByName(lyrName));     
        });
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>


