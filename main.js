var canvas = document.getElementById("renderCanvas");

        var engine = null;
        var sceneToRender = null;
        var webarStage = null;
        var stageReadyVariable = 0;
        var gamescreenEnable = false;
        var tracking = false;
        var gameOverCheck = false;

        var point = 0;
        var oldPoint = 0;

        var life = 5;

        var shootCounter = 0;
        var enemyCount = 30;

        var timecount = 90;

        var musicStatus = true;
        
        var scaleByFactor = function(obj, factor) {
            obj.scaling.x = obj.scaling.x * factor;
            obj.scaling.y = obj.scaling.y * factor;
            obj.scaling.z = obj.scaling.z * factor;
        }

        function createDefaultEngine () { 
            return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); 
        };

        function createScene () {
            var scene = new BABYLON.Scene(engine);
            //scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./models/environment.dds", scene);


            //bippar needs UniversalCamera
            var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
            //camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

            //Added for shooting from drone - for dev 
            //var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
            var gravityVector = new BABYLON.Vector3(0,-1, 0);
            var physicsPlugin = new BABYLON.CannonJSPlugin();
            scene.enablePhysics(gravityVector, physicsPlugin);

            var music = new BABYLON.Sound(
                "Music", "music/civil-war.mp3", scene, null, { 
                   volume: 0.5,
                    loop: true, 
                   autoplay: true,
                   spatialSound: true,
                   
                }
             );
             //music.setVolume(0,3);

            const bombSound = new BABYLON.Sound("bombSound", "music/silenced-gun.mp3", scene, null,{volume:0.5});

            var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(5, 10, -2), scene);
            light.intensity = 0.7;

            var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
            
            var instruction = null;
            var startButton = null;

            function menuScreen() {
                // create a GUI for the menu screen
                //var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

                // Adding image
                var iconImage = new BABYLON.GUI.Image("aero" + "_icon", "images/5.png");
                iconImage.width = 1;
                iconImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                iconImage.top = "-260px";
                advancedTexture.addControl(iconImage); 

                var menuImage = new BABYLON.GUI.Image("aero" + "_icon", "images/7.png");
                menuImage.width = 1.2;
                menuImage.height = 1.2;
                //menuImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                menuImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                menuImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                menuImage.top = "200px";
                advancedTexture.addControl(menuImage); 


                // create a header label for the menu
                var header = new BABYLON.GUI.TextBlock();
                header.text = "AERO ";
                header.fontSize = 48;
                header.color = "red";
                header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                header.top = "-250px";
                //advancedTexture.addControl(header);

                instruction = new BABYLON.GUI.TextBlock();
                instruction.text = "slow move your phone left and right \n to setup Surface Tracking ";
                instruction.fontSize = 20;
                instruction.color = "white";
                instruction.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                instruction.top = "-150px";
                advancedTexture.addControl(instruction);
    
                // create a start button for the menu
                startButton = BABYLON.GUI.Button.CreateSimpleButton("Play", "Play");
                startButton.width = "150px";
                startButton.height = "60px";
                startButton.color = "white";
                startButton.cornerRadius = 20;
                startButton.background = "gray";
                startButton.top = "100px";
                startButton.onPointerUpObservable.add(function() {
                    // start the game when the button is clicked
                    if( stageReadyVariable == 1){
                        startGame();
                    }
                    
                });

                // create a start button for the menu
                instructionsButton = BABYLON.GUI.Button.CreateSimpleButton("Instructions", "Instructions");
                instructionsButton.width = "150px";//200
                instructionsButton.height = "60px";//100
                instructionsButton.color = "white";
                instructionsButton.cornerRadius = 20;
                instructionsButton.background = "#46209F";//"blue";
                instructionsButton.top = "200px";
                instructionsButton.onPointerUpObservable.add(function() {
                    instructionPage();
                    
                });

                // create a start button for the menu
                soundButton = BABYLON.GUI.Button.CreateSimpleButton("Sound", "Sound : On");
                soundButton.width = "150px";
                soundButton.height = "60px";
                soundButton.color = "white";
                soundButton.cornerRadius = 20;
                soundButton.background = "#46209F";
                soundButton.top = "300px";
                soundButton.onPointerUpObservable.add(function() {
                    if (musicStatus == true){
                        music.setVolume(0,1);
                        soundButton.textBlock.text = "Sound : Off";
                        soundButton.background = "gray";
                        musicStatus = false;
                    }
                    else{
                        music.setVolume(1,1);
                        soundButton.textBlock.text = "Sound : On";
                        soundButton.background = "#46209F";
                        musicStatus = true;
                    }
                    
                });
               
                advancedTexture.addControl(startButton);
                advancedTexture.addControl(instructionsButton);
                advancedTexture.addControl(soundButton);
                
                /*
                // create a quit button for the menu
                var quitButton = BABYLON.GUI.Button.CreateSimpleButton("Settings", "Settings");
                quitButton.width = "200px";
                quitButton.height = "50px";
                quitButton.color = "white";
                quitButton.cornerRadius = 20;
                quitButton.background = "red";
                quitButton.top = "80px";
                quitButton.onPointerUpObservable.add(function() {
                    // quit the game when the button is clicked
                    //window.close();
                });
                advancedTexture.addControl(quitButton);
                */
                // function to start the game
                function startGame() {
                    // remove the menu 
                    iconImage.dispose();
                    header.dispose();
                    instruction.dispose();
                    startButton.dispose();
                    instructionsButton.dispose();
                    soundButton.dispose();
                    menuImage.dispose();
                    gameOverCheck = true;

                    gamescreenEnable = true;
                }

            }

            function instructionPage(){

                var instructionPageScreen = new BABYLON.GUI.Rectangle();
                instructionPageScreen.width = 1;
                instructionPageScreen.height = 0.4;
                instructionPageScreen.color = "#C8099B";
                instructionPageScreen.alpha = 0.9;
                instructionPageScreen.cornerRadius = 20;
                instructionPageScreen.thickness = 10;
                instructionPageScreen.background = "#46209F";
                instructionPageScreen.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                instructionPageScreen.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                instructionPageScreen.top = "50px";

                var instructionPageHeading = new BABYLON.GUI.TextBlock();
                instructionPageHeading.text = "Instructions";
                instructionPageHeading.color = "White";
                instructionPageHeading.fontSize = 40;
                instructionPageHeading.top = "-110px";
                //instructionPageHeading.left = "-140px";
                instructionPageHeading.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                instructionPageHeading.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

                var InstructionInfo = new BABYLON.GUI.TextBlock();
                InstructionInfo.text = "Press Fire to Shoot the ghost to win XP.\n\nTimer will run out, keep your eye on the top.\n\nLife will reduced when ghost attacks the player";
                InstructionInfo.color = "white";
                InstructionInfo.fontSize = 16;
                InstructionInfo.top = "0px";
                InstructionInfo.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                InstructionInfo.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            
                var okButton = BABYLON.GUI.Button.CreateSimpleButton("okButton", "Ok");
                okButton.width = 0.3;
                okButton.height = "60px";
                okButton.color = "White";
                okButton.cornerRadius = 20;
                okButton.background = "#C8099B";
                //okButton.top = "0px";
                //okButton.left = "-60px";
                okButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                okButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                okButton.onPointerUpObservable.add(function() {
                    instructionPageScreen.dispose();
                });            
                
                advancedTexture.addControl(instructionPageScreen);
                instructionPageScreen.addControl(instructionPageHeading);
                instructionPageScreen.addControl(InstructionInfo);
                instructionPageScreen.addControl(okButton);
            }




            var gun = [];
            var cannonfoot = null;
            var cannontube = null;
            var itarg = null;
            var pointer = null;
            function gameElements() {
                // Create an empty webarStage mesh. Models/meshes appended as a children to this webarStage mesh will be displayed on the surface.
                webarStage = new BABYLON.Mesh("webarStage", scene);

                // Create a time varying PBR material for the base cylinder mesh
                /*var pbr = new BABYLON.PBRMaterial("pbr", scene);
                pbr.metallic = 1.0;
                pbr.roughness = 0;
                pbr.subSurface.isRefractionEnabled = true;
                pbr.subSurface.indexOfRefraction = 1.5;
                pbr.subSurface.tintColor = new BABYLON.Color3(0.5, 0, 0);
                var a = 0;
                scene.beforeRender = () => {
                    a += 0.05;
                    pbr.subSurface.tintColor.g = Math.cos(a) * 0.5 + 0.5;
                    pbr.subSurface.tintColor.b = pbr.subSurface.tintColor.g;
                }

                // Create primitive shape using mesh builder and set webarStage as its parent so that it appears on the surface
                var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {height: 0.1, diameterTop: 1, diameterBottom: 1, tessellation: 128}, scene);
                cylinder.material = pbr;
                cylinder.position.y = 0.125;
                cylinder.position.z = -0.075;
                cylinder.setParent(webarStage);
                
                // Start spark and smoke particles
                startParticles(scene, webarStage);
                */


                // Import a gltf model to the scene and scale appropriately. No need to set the parent to webarStage mesh.
                // All gltf models imported to the scene are created under __root__ node by babylon.
                // After the complete scene is ready, it is models under __root_ node are moved to webarStage mesh
                // to appear on the surface
                //BABYLON.SceneLoader.ImportMesh(['Object_2'], "./models/", "oscar_trophy.glb", scene, function (meshes, particleSystems, skeletons) {
                    //['Object_8']
                /*BABYLON.SceneLoader.ImportMesh("", "./models/model/", "gun.glb", scene, function (meshes, particleSystems, skeletons) {
                
                    let xQuat = new BABYLON.Quaternion();
                    BABYLON.Quaternion.FromEulerAnglesToRef(Math.PI / 2, 0, 0, xQuat);

                    for (mesh of meshes) {
                        console.info(mesh.name);
                        if (mesh.name !== '__root__') {
                            // Move the loaded models to webarStage
                            mesh.setParent(webarStage);
                            //mesh.rotationQuaternion.multiplyInPlace(xQuat);

                            //scaleByFactor(mesh, 0.0375);
                        }
                    }
                });*/
                

                //BABYLON.SceneLoader.ImportMesh("", "./models/model/", "drone.babylon", scene, function (newMeshes) {
                /*BABYLON.SceneLoader.ImportMesh("", "./models/model/", "ghost.glb", scene, function (newMeshes) {
                        var _i=0;
                        //newMeshes[0].setParent(webarStage);

                    var xm=[];
                    for (mesh of newMeshes){
                        xm[_i]=mesh;
                        
                        _i += 1;
                        console.info(_i);
                        scaleByFactor(xm[_i], 0.0001);
                    }
                    xm[0].setParent(webarStage);
                    xm[0].position.set(buggy2.position.x,buggy2.position.y,10)
                /var buggy2 = newMeshes[1];
        
                //camera.target = buggy2;
                //buggy2.setParent(camera);
                //buggy2.rotation.set(3*Math.PI/2, Math.PI, 0);
                //buggy2.position.set(buggy2.position.x,buggy2.position.y,-5)
                //scaleByFactor(buggy2, 0.00009);
                //
                
        

                //var decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);
                //var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 300, height:15}, scene);
                //ground.material = decalMaterial;	
                });	
                */

                //Added for shooting as gun
                cannonfoot = BABYLON.MeshBuilder.CreateBox("Foot", { width: 1, height: 0.5, depth: 0.4 }, scene);
                //cannonfoot.position.set(-5, 1, 8);// behind me the cannon apprears
                //cannonfoot.position.set(0, -1, 2); //infront canon appears
                
                //cannonfoot.rotation.set(0, 7*Math.PI/8, 0);
                scaleByFactor(cannonfoot, 2);
                
                cannontube = BABYLON.MeshBuilder.CreateCylinder("Tube", { height: 1, diameter: 0.2, tessellation: 16 }, scene);
                cannontube.position.set(0, 0, 0);
                //scaleByFactor(cannontube, 2);

                itarg = BABYLON.Mesh.CreateBox("targ", 0.5, scene);
                itarg.position.y = 3;
                
                itarg.visibility = .01;
                itarg.parent = cannontube;
                //scaleByFactor(itarg, 0.5);

                
                BABYLON.SceneLoader.ImportMesh("", "./models/model/", "gun.glb", scene, function (meshes, particleSystems, skeletons) {
                
                    let xQuat = new BABYLON.Quaternion();
                    BABYLON.Quaternion.FromEulerAnglesToRef(Math.PI / 2, 0, 0, xQuat);
                    for (var i=0; i<meshes.length; i++) {
                        var mesh = meshes[i];
                        console.info(mesh.name);
                        if (mesh.name !== '__root__') {
                            // Move the loaded models to webarStage
                            mesh.setParent(cannonfoot);
                            //mesh.rotationQuaternion.multiplyInPlace(xQuat);
                            mesh.rotation.set(180,0,0);
                            mesh.position.set(0,0,-0.5);
                            scaleByFactor(mesh, 0.1);

                            cannontube.position.set(0,0,3);
                            //itarg.position.set(0,0,1);
                            //mesh.visibility=0;
                            gun.push(mesh);//its not used anywhere, has issue in visibility
                     
                        }
                    }
                });

                var objInXRStage = 0;
                if(objInXRStage == 1){
                    cannontube.rotation.set(3*Math.PI/2, 0, 0);

                    cannontube.parent = cannonfoot; 

                    cannonfoot.setParent(webarStage);
                    cannonfoot.position.set(0, -1, -2); //infront canon appears

                    cannontube.rotation.addInPlace(new BABYLON.Vector3(Math.PI/12, 0, 0));


                }else{           
                    cannontube.rotation.set(3*Math.PI/2, 6*Math.PI/2, 0);
                    //cannontube.rotation.set(0, 6*Math.PI/2, 0);
                    //cannontube.rotation.set(3*Math.PI/2, 0, 0);

                    cannontube.parent = cannonfoot; 

                    cannonfoot.setParent(camera);
                    cannonfoot.position.set(0, -5, 10); //infront canon appears

                    cannontube.position.addInPlace(new BABYLON.Vector3(0, 0, 1));
                    cannontube.rotation.addInPlace(new BABYLON.Vector3(Math.PI/12, 0, 0));

                    cannonfoot.visibility = 0;
                    cannontube.visibility = 0;

                }
            }
            var button1 = null;
            var rect1 = null;
            var rect2 = null;
            var rect3 = null;
            var label = null;
            var label1 = null;
            var label2 = null;
            var mesh = null;

            var scoreImage = null;

            var timeBlock = null;

            function gameScreen(){
                // GUI
                //var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                scoreImage = new BABYLON.GUI.Image("14", "images/14.png");
                scoreImage.width = 1.2;
                scoreImage.height = 1.2;
                //scoreImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                scoreImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                scoreImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                scoreImage.top = "100px";
                
                

                button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Fire");
                button1.width = "160px"
                button1.height = "100px";
                button1.color = "white";
                button1.cornerRadius = 20;
                button1.background = "#C8099B";
                button1.onPointerDownObservable.add(function() {
                    shootCounter += 1;
                    var power = 10;
                    firebullet(power);
                    bombSound.play();
                    console.info("firebullet");
                    //castRay();
                });
                button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; //move button to bottem end
                button1.top = "-40px"; // move button little over cannonfoot
                //advancedTexture.addControl(button1); 
                
                rect1 = new BABYLON.GUI.Rectangle();
                rect1.width = 0.2;
                rect1.height = "80px";
                rect1.cornerRadius = 20;
                rect1.color = "Orange";
                rect1.thickness = 4;
                rect1.background = "#46209F";
                rect1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; //move button to bottem end
                rect1.top = "-40px"; // move button little over cannonfoot
                rect1.left = "-140px"; // move button
                //advancedTexture.addControl(rect1);
    

                label = new BABYLON.GUI.TextBlock();
                label.text = "Smash \n " +point;
                //rect1.addControl(label);

                rect2 = new BABYLON.GUI.Rectangle();
                rect2.width = 0.2;
                rect2.height = "80px";
                rect2.cornerRadius = 20;
                rect2.color = "Orange";
                rect2.thickness = 4;
                rect2.background = "#46209F";
                rect2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; //move button to bottem end
                rect2.top = "-40px"; // move button little over cannonfoot
                rect2.left = "140px"; // move button
                //advancedTexture.addControl(rect2);
    

                label1 = new BABYLON.GUI.TextBlock();
                label1.text = "Life \n" +"XXXXX";
                //label1.text = "Life";// +"XXXXX";

                //label2 = new BABYLON.GUI.TextBlock();
                //label2.text = "XXXXX";
                //rect2.addControl(label1);

                /*mesh = BABYLON.MeshBuilder.CreateDisc('disc', { radius: 1 }, scene);
                var mat = new BABYLON.StandardMaterial('disc-mat', scene);
                var tex = new BABYLON.Texture('./images/heart.svg', scene, false, false);
                tex.hasAlpha = true;
                mat.opacityTexture = tex;
                mat.emissiveColor = BABYLON.Color3.White();
                mesh.material = mat;*/

                timeBlock = new BABYLON.GUI.TextBlock('TextBlock', '120'); 

                rect3 = new BABYLON.GUI.Rectangle();
                rect3.width = 0.1;
                rect3.horizontalAlignment = 0;
                rect3.verticalAlignment = 0;
                rect3.height = "40px";
                rect3.cornerRadius = 30;
                rect3.color = "orange";
                rect3.thickness = 4;
                rect3.background = "#46209F";
                rect3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP; 
                rect3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; 
                rect3.top = "20px"; // move button little over cannonfoot
                //rect3.left = "140px"; // move button


                pointer = new BABYLON.GUI.Image("pointer" + "_icon", "images/dot.png");
                pointer.width = "2%";
                pointer.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                pointer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                pointer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                //pointer.top = "-50px";
                //pointer.left = "-20px";
                pointer.visibility = 0.2;
                
                
            }
            
            function gameScreenAddController() {

                cannonfoot.visibility = 1;
                cannontube.visibility = 1;
               
                advancedTexture.addControl(scoreImage); 
                advancedTexture.addControl(button1); 
                advancedTexture.addControl(rect1);
                rect1.addControl(label);
                advancedTexture.addControl(rect2);
                rect2.addControl(label1);
                //rect2.addControl(label2);
                //rect2.addControl(mesh);

                advancedTexture.addControl(rect3);
                rect3.addControl(timeBlock);

                advancedTexture.addControl(pointer);

            }

            // Create the enemies
            //BABYLON.SceneLoader.Load("", "models/model/", "skull.obj", scene, function (newMeshes2, particleSystems2, skeletons2) {
            /*BABYLON.MeshBuilder.CreateCylinder("enemy", { height: 1, diameter: 0.4, tessellation: 16 }, scene, function (newMeshes2, particleSystems2, skeletons2){
                var dude = newMeshes2[0];

                for (var index = 1; index < newMeshes2.length; index++) {
                    shadowGenerator.getShadowMap().renderList.push(newMeshes2[index]);
                }

                for (var count = 0; count < 10; count++) {
                    var offsetX = 200 * Math.random() - 100;
                    var offsetZ = 200 * Math.random() - 100;
                    for (index = 1; index < newMeshes2.length; index++) {
                        var instance = newMeshes2[index].createInstance("instance" + count);

                        shadowGenerator.getShadowMap().renderList.push(instance);

                        instance.parent = newMeshes2[index].parent;
                        instance.position = newMeshes2[index].position.clone();

                        if (!instance.parent.subMeshes) {
                            instance.position.x += offsetX;
                            instance.position.z -= offsetZ;
                        }
                    }
                }

                dude.rotation.y = Math.PI;
                dude.position = new BABYLON.Vector3(0, 0, 0);
                scaleByFactor(dude, 2);
                dude.setParent(camera);

                scene.beginAnimation(skeletons2[0], 0, 100, true, 1.0);
            });
            */

            //next to function works as same
            function randomInteger(min, max) { 
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            //change the mesh effect // https://playground.babylonjs.com/#1MSIXB#4
            function effectOnMesh(enemyObj) {
                var material_base = new BABYLON.StandardMaterial("mat", scene);
                //material_base.diffuseTexture = new BABYLON.Texture("textures/misc.jpg", scene);
                material_base.alpha = 0.9999;		// artificially set the material as alpha blended
                material_base.ambientColor = BABYLON.Color3.White();

                var alphamodes = [
                    BABYLON.Engine.ALPHA_COMBINE,
                    BABYLON.Engine.ALPHA_ADD,
                    BABYLON.Engine.ALPHA_SUBTRACT,
                    BABYLON.Engine.ALPHA_MULTIPLY,
                    BABYLON.Engine.ALPHA_MAXIMIZED
                ];

                var mat = material_base.clone(null);
		        mat.alphaMode = alphamodes[randomInteger(0,5)];
		        enemyObj.material = mat;
                return enemyObj;

            }

            
            async function particlegun(obj){
                var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
                        particleSystem.particleTexture = new BABYLON.Texture("textures/gunFire.png", scene);
                        particleSystem.emitter = obj;
                        particleSystem.minEmitBox = new BABYLON.Vector3(-0.01, 0, -0.5);
                        particleSystem.maxEmitBox = new BABYLON.Vector3(0.01, 0, -0.4);
                        
                        //particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
                        //particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
                        //particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
                        particleSystem.minSize = 0.1;
                        particleSystem.maxSize = 0.3;
                        particleSystem.minLifeTime = 0.01;
                        particleSystem.maxLifeTime = 0.2;
                        particleSystem.emitRate = 100;
                        //particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
                        //particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
                        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
                        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
                        particleSystem.minAngularSpeed = 0;
                        particleSystem.maxAngularSpeed = Math.PI;
                        particleSystem.minEmitPower = 1;
                        particleSystem.maxEmitPower = 3;
                        particleSystem.updateSpeed = 0.005;
                        
                        
                        particleSystem.start();
                        await BABYLON.Tools.DelayAsync(200);
                        particleSystem.stop();

                        
            }
            async function particleBlast(obj){
                var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
                        particleSystem.particleTexture = new BABYLON.Texture("textures/Flare.png", scene);
                        particleSystem.emitter = obj;
                        particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
                        particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
                        
                        /*particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
                        particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
                        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
                        particleSystem.minSize = 0.3;
                        particleSystem.maxSize = 1.5;
                        particleSystem.minLifeTime = 0.3;
                        particleSystem.maxLifeTime = 1.5;
                        particleSystem.emitRate = 1000;
                        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
                        particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
                        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
                        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
                        particleSystem.minAngularSpeed = 0;
                        particleSystem.maxAngularSpeed = Math.PI;
                        particleSystem.minEmitPower = 1;
                        particleSystem.maxEmitPower = 3;
                        particleSystem.updateSpeed = 0.005;
                        */
                        
                        particleSystem.start();
                        await BABYLON.Tools.DelayAsync(1000);
                        particleSystem.stop();           
            }

            var postProcess = new BABYLON.ImageProcessingPostProcess("processing", 1.0, camera);
            postProcess.vignetteWeight = 10;
            postProcess.vignetteStretch = 2;
            postProcess.vignetteColor = new BABYLON.Color4(1, 0, 0, 0);

            function flashRed() {
                console.info("flash");
                postProcess.vignetteEnabled = true;

                setTimeout(function() {          
                    postProcess.vignetteEnabled = false;
                }, 1000); // Flash duration in milliseconds
            }


            function createEnemy(name,x,y,z){
                const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

                myMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
                myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
                myMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
                myMaterial.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);

                
                //var enemyObj = BABYLON.MeshBuilder.CreateCylinder(name, { height: 0.5, diameter: 0.6, tessellation: 16 }, scene);
                var enemyObj = BABYLON.Mesh.CreateCylinder(name, 3, 3, 0, 6, 1, scene, false);
                //enemyObj.material = new BABYLON.StandardMaterial("c6mat", scene);
                //enemyObj.material = new BABYLON.StandardMaterial("whiteMaterial", scene);
                //enemyObj.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
                enemyObj.material = myMaterial;
                
                enemyObj.position.set(x,y,z);
                //enemyObj.physicsImpostor = new BABYLON.PhysicsImpostor(enemyObj, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                //enemyObj.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(1, 5, 1));
         

                //effectOnMesh(enemyObj);
                console.info("enemy created");

                scaleByFactor(enemyObj, 2);

                var shield = BABYLON.MeshBuilder.CreateCylinder(name, {height:3, diameterTop: 3, diameterBottom: 3, tessellation: 32}, scene);
                shield.parent = enemyObj;
                shield.position.y = 2;
                shield.physicsImpostor = new BABYLON.PhysicsImpostor(shield, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                shield.visibility=0;

                var cylinder = BABYLON.MeshBuilder.CreateCylinder(name, {height: 0.5, diameterTop: 3, diameterBottom: 4, tessellation: 32}, scene);
                cylinder.parent = enemyObj;
                cylinder.position.y = 1.5;
                //cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(cylinder, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                

                var mesh = null;
                BABYLON.SceneLoader.ImportMesh("", "./models/model/", "obj.glb", scene, function (meshes, particleSystems, skeletons) {
                
                    let xQuat = new BABYLON.Quaternion();
                    BABYLON.Quaternion.FromEulerAnglesToRef(Math.PI / 2, 0, 0, xQuat);
                    for (var i=0; i<meshes.length; i++) {
                        mesh = meshes[i];
                        //console.info(mesh.name);
                        if (mesh.name !== '__root__') {
                            
                            mesh.name = name
                            mesh.material = myMaterial;
                            mesh.rotation
                            // Move the loaded models to webarStage
                            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                
                            mesh.parent = enemyObj;
                            mesh.position.y = 2;
                            
                            enemyObj.rotation.y = -60;

                            //mesh.rotationQuaternion.multiplyInPlace(xQuat);
                            //mesh.rotation.set(180,0,0);
                            //mesh.position.set(x,y,z);//set(0,0,20);
                           // scaleByFactor(mesh, 0.1);

                          
             
                        }
                    }
                });
                enemyObj.physicsImpostor = new BABYLON.PhysicsImpostor(enemyObj, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                
                /*scene.registerAfterRender(function() {
                    shield.rotation.y += 5; // Spin around the y-axis
                });*/
       
        
    enemyObj.lastSlideTime = 0;
                var moveSpeed = Math.random() * 0.5 + 0.55;//0.05 // randomly set movement speed for enemy
                var approachInterval = Math.random() * 1000 + 1000;//1000 // randomly set time interval for enemy to approach player
                //console.info(name+"  :movespeed-"+moveSpeed+"  approachInterval "+ approachInterval);


                enemyObj.move = function() {

                     // Define the sliding interval in milliseconds
    let slideInterval = 3000;

    // Check if it's time to slide
    if (this.lastSlideTime === undefined || Date.now() - this.lastSlideTime > slideInterval) {
        // Generate a random direction to slide in
        let direction = new BABYLON.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1);
        direction.normalize();

        // Multiply the direction by a random distance to slide
        let distance = Math.random() * 10;
        let offset = direction.scale(distance);

        // Move the enemy in the slide direction
        this.position.addInPlace(offset);

        // Update the last slide time
        this.lastSlideTime = Date.now();

        // generate a random scaling factor
        var scalingFactor = Math.random() * 0.5 + 0.5;
        this.scaling = new BABYLON.Vector3(scalingFactor, scalingFactor, scalingFactor);

    }
                    var min = -0.1;
                    var max = 0.1;
                    // move the enemy in random direction
                    var x = Math.random() * 0.2 - 0.1;
                    var z = Math.random() * 0.25 - 0.1; //0.23
                    
                    
                    if(this.position.z < -1)
                        this.position.addInPlace(new BABYLON.Vector3(x, 0, z));
                    else if(this.position.z > 1)
                        this.position.addInPlace(new BABYLON.Vector3(x, 0, z*-1));

                    //this.position.addInPlace(new BABYLON.Vector3(x, 0, z));
                    //console.info(this+"-"+this.position);
                    // calculate distance to player
                    var distance = BABYLON.Vector3.Distance(this.position, cannonfoot.position);
                    
                    //console.info("Moving enemy-",this.name,"\ndistance",distance,"\nx,z-",x ,z,z*-1 );
                    
                    // if distance to player is less than 10 units, move the enemy towards the player
                    /*if (distance < 10) {
                        var direction = cannonfoot.position.subtract(this.position);
                        direction.normalize();
                        this.position.addInPlace(direction.scale(moveSpeed));
                        console.info("  attack....")
                        enemyObj.dispose();
                    }*/

                    // if distance to player is less than 10 units, explode the enemy
                    if (distance < 10) {
                        console.info("  attack....");
                        
                        //this.dispose();
                        //.dispose();
                        if (this.position.y <= 0) {
                            this.position.addInPlace(new BABYLON.Vector3(0, -10, 0));
                        } else {
                            this.position.addInPlace(new BABYLON.Vector3(0, 10, 0));
                        }
                        life -= 1;
                        flashRed();
                        if(life <= 0) life = 0;

                        var index = enemy.indexOf(this);
                        console.info("enemy "+index+"  attack....")
                        particleBlast(enemy[index]);
                        if(enemy[index].physicsImpostor){
                            enemy[index].physicsImpostor.dispose()
                        }
                        enemy[index].dispose();
                        
                        if (index !== -1) {
                            enemy[index] = null;
                            enemy.splice(index, 1);
                            for(var c=0; c<enemy.length; c++) 
                                console.log(enemy[c].id); // output the enemy array
                        }
                        
                        console.info("enemy length: "+ enemy.length);
                    }
                    // if distance to player is less than 10 units, move the enemy towards the player
                    else if (distance < 15) {
                        console.info("enemy "+index+"  it's nearer");
                        var direction = cannonfoot.position.subtract(this.position);
                        direction.normalize();
                        this.position.addInPlace(direction.scale(moveSpeed));
                    }
                    else if (distance < 30) {
                        console.info("enemy "+index+"  on the range...");
                        var dx = cannonfoot.position.x - this.position.x;
                        var dy = cannonfoot.position.y - this.position.y;
            
                        if (Math.abs(dx) > 20 || Math.abs(dy) > 10) {
                            // move enemy towards player if the enemy's position goes beyond the player whose x and y position is greater than 10 units away
                            var direction = cannonfoot.position.subtract(this.position);
                            direction.normalize();
                            this.position.addInPlace(direction.scale(moveSpeed));
                        }
                    }
                }

                return enemyObj;
            }

            function createEnemy2 (name,x,y,z){
                var enemyObj = BABYLON.Mesh.CreateCylinder(name, 3, 3, 0, 6, 1, scene, false);
                enemyObj.material = new BABYLON.StandardMaterial("enemyMat", scene);
                //enemyObj.material = pbr;//new BABYLON.StandardMaterial("enemyMat", scene);
                enemyObj.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                enemyObj.position.set(x,y,z);
                enemyObj.physicsImpostor = new BABYLON.PhysicsImpostor(enemyObj, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                scaleByFactor(enemyObj,1.5);
                
                var moveSpeed = Math.random() * 0.5 + 0.55;//0.05 // randomly set movement speed for enemy
                var approachInterval = Math.random() * 1000 + 1000;//1000 // randomly set time interval for enemy to approach player
                //console.info(name+"  :movespeed-"+moveSpeed+"  approachInterval "+ approachInterval);


                enemyObj.move = function() {
                    var min = -0.1;
                    var max = 0.1;
                    // move the enemy in random direction
                    var x = Math.random() * 0.2 - 0.1;
                    var z = Math.random() * 0.25 - 0.1; //0.23
                    
                    
                    if(this.position.z < -1)
                        this.position.addInPlace(new BABYLON.Vector3(x, 0, z));
                    else if(this.position.z > 1)
                        this.position.addInPlace(new BABYLON.Vector3(x, 0, z*-1));

                    //this.position.addInPlace(new BABYLON.Vector3(x, 0, z));
                    //console.info(this+"-"+this.position);
                    // calculate distance to player
                    var distance = BABYLON.Vector3.Distance(this.position, cannonfoot.position);
                    
                    //console.info("Moving enemy-",this.name,"\ndistance",distance,"\nx,z-",x ,z,z*-1 );
                    
                    // if distance to player is less than 10 units, move the enemy towards the player
                    /*if (distance < 10) {
                        var direction = cannonfoot.position.subtract(this.position);
                        direction.normalize();
                        this.position.addInPlace(direction.scale(moveSpeed));
                        console.info("  attack....")
                        enemyObj.dispose();
                    }*/

                    // if distance to player is less than 10 units, explode the enemy
                    if (distance < 10) {
                        console.info("  attack....")
                        
                        //this.dispose();
                        //.dispose();
                        if (this.position.y <= 0) {
                            this.position.addInPlace(new BABYLON.Vector3(0, -10, 0));
                        } else {
                            this.position.addInPlace(new BABYLON.Vector3(0, 10, 0));
                        }
                        life -= 1;
                        if(life <= 0) life = 0;

                        var index = enemy.indexOf(this);
                        console.info("enemy "+index+"  attack....")
                        particleBlast(enemy[index]);
                        if(enemy[index].physicsImpostor){
                            enemy[index].physicsImpostor.dispose()
                        }
                        enemy[index].dispose();
                        
                        if (index !== -1) {
                            enemy[index] = null;
                            enemy.splice(index, 1);
                            for(var c=0; c<enemy.length; c++) 
                                console.log(enemy[c].id); // output the enemy array
                        }
                        
                        console.info("enemy length: "+ enemy.length);
                    }
                    // if distance to player is less than 10 units, move the enemy towards the player
                    else if (distance < 15) {
                        var direction = cannonfoot.position.subtract(this.position);
                        direction.normalize();
                        this.position.addInPlace(direction.scale(moveSpeed));
                    }
                    else if (distance < 30) {
                        var dx = cannonfoot.position.x - this.position.x;
                        var dy = cannonfoot.position.y - this.position.y;
            
                        if (Math.abs(dx) > 20 || Math.abs(dy) > 10) {
                            // move enemy towards player if the enemy's position goes beyond the player whose x and y position is greater than 10 units away
                            var direction = cannonfoot.position.subtract(this.position);
                            direction.normalize();
                            this.position.addInPlace(direction.scale(moveSpeed));
                        }
                    }
                };
            
                //setInterval(function() {  enemyObj.move();   }, approachInterval);
            
                return enemyObj;
            };

            
            
            function moveEnemies() {
                for (var i = 0; i < enemy.length; i++) {
                    enemy[i].move();
                }
            };

            var enemy = [];
            function generateEnemies() {
                //var box1 = BABYLON.Mesh.CreateBox("name", 5.0, scene);
                //box1.position.z = -10;
                //box1.setParent(webarStage);

               
                for(var i=0; i< enemyCount; i++){
                    
                    //randomInteger(-5,10)
                    if(i< enemyCount/1.5)
                        enemy[i] = createEnemy("enemy"+i,randomInteger(-80,80),randomInteger(-10,40),randomInteger(-40,-200));
                    else
                        enemy[i] = createEnemy("enemy"+i,randomInteger(-80,80),randomInteger(-10,40),randomInteger(40,200));

                    //enemy[i] = createEnemy("enemy"+i,randomInteger(-20,20),randomInteger(-15,20),randomInteger(-60,-80));
                    //en.checkCollision = true;
                    enemy[i].setParent(webarStage);
            
                    //enemy[i] = createEnemy();
                    //webarStage.addChild(createEnemy());
                    //scaleByFactor(enemy[i], 2);
                    
                }
                //animateSlide(enemy[0]);
                
            }
            function animateSlide(obj){
                
                var frameRate = 10;

                //Position Animation
                var xSlide = new BABYLON.Animation("xSlide", "position.x", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                
                var keyFramesP = []; 
            
                keyFramesP.push({
                    frame: 0,
                    value: obj.position.x
                });
            
                keyFramesP.push({
                    frame: frameRate,
                    value: obj.position.x + 20
                });
            
                keyFramesP.push({
                    frame: 10 * frameRate,
                    value: obj.position.x - 20
                });
            
            
                xSlide.setKeys(keyFramesP);
            
                //Rotation Animation
                var yRot = new BABYLON.Animation("yRot", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            
                var keyFramesR = []; 
            
                keyFramesR.push({
                    frame: 0,
                    value: 0
                });
            
                keyFramesR.push({
                    frame: frameRate,
                    value: Math.PI
                });
            
                keyFramesR.push({
                    frame: 2 * frameRate,
                    value: 2 * Math.PI
                });
            
            
                yRot.setKeys(keyFramesR);

                
            
                scene.beginDirectAnimation(obj, [xSlide, yRot], 0, 2 * frameRate, true);
                //scene.beginDirectAnimation(box1, xSlide, 0, 2 * frameRate, true);
            }

            function firebullet (power) {
                particlegun(itarg);
                var bullet = BABYLON.MeshBuilder.CreateSphere("Bullet", { segments: 3, diameter: 0.5}, scene);
                bullet.position = cannontube.getAbsolutePosition();
                bullet.scaling.y -= 0.2;
                bullet.scaling.x -= 0.2;
                bullet.isPickable = false; 
                bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0.5, restition: 0.9 }, scene);
                
                //bullet.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, -20));
                //scaleByFactor(bullet, 0.4);

                //random color
                const sphereMaterial = new BABYLON.StandardMaterial("material", scene);
                sphereMaterial.diffuseColor = BABYLON.Color3.Random();
                bullet.material = sphereMaterial;

                //pbr shine
                var pbr = new BABYLON.PBRMaterial("pbr", scene);
                pbr.metallic = 1.0;
                pbr.roughness = 0;
                pbr.subSurface.isRefractionEnabled = true;
                pbr.subSurface.indexOfRefraction = 1.5;
                pbr.subSurface.tintColor = new BABYLON.Color3(0.5, 0, 0);
                var a = 0;
                scene.beforeRender = () => {
                    a += 0.05;
                    pbr.subSurface.tintColor.g = Math.cos(a) * 0.5 + 0.5;
                    pbr.subSurface.tintColor.b = pbr.subSurface.tintColor.g;
                }

                //bullet.material = pbr;

                //console.info(bullet);

                var dir = itarg.getAbsolutePosition().subtract(cannontube.getAbsolutePosition());
                bullet.physicsImpostor.applyImpulse(dir.scale(power), cannontube.getAbsolutePosition());
                bullet.life = 0
                
                bullet.step = ()=>{
                    bullet.life++
                    if(bullet.life>120 && bullet.physicsImpostor){
                        bullet.physicsImpostor.dispose()
                        bullet.dispose()                
                    }
                }

                bullet.physicsImpostor.onCollideEvent = (e, t)=>{
                    console.info("bullet collide-",e,t)
                    console.info(t.object.name);
                    t.object.dispose();
                    particleBlast(t.object);
                    point +=1;
                    //castRay(bullet);
                }

                scene.onBeforeRenderObservable.add(bullet.step)   

                //bullet.checkCollision = true;
                bullet.setParent(webarStage);

            }

            function vecToLocal(vector, mesh){
                var m = mesh.getWorldMatrix();
                var v = BABYLON.Vector3.TransformCoordinates(vector, m);
                return v;		 
            }

            function castRay(obj){       
                var origin = obj.position;
            
                var forward = new BABYLON.Vector3(0,1,1);		
                forward = vecToLocal(forward, obj);
            
                var direction = forward.subtract(origin);
                direction = BABYLON.Vector3.Normalize(direction);
            
                var length = 10;
            
                var ray = new BABYLON.Ray(origin, direction, length);

                let rayHelper = new BABYLON.RayHelper(ray);		
		        rayHelper.show(scene);		


                var hit = scene.pickWithRay(ray);

                if (hit.pickedMesh){
                //hit.pickedMesh.scaling.y += 0.1;
                console.info("hit   picked  ");
                console.log(hit.pickedMesh.name);
                if (hit.pickedMesh.name != "Tube"){
                    hit.pickedMesh.dispose();
                }
                   
                point +=1;


                //hit.pickedMesh.scaling.x += 10
                //var dir = hit.pickedPoint.subtract(scene.activeCamera.position);
                //dir.normalize();
                //hit.pickedMesh.applyImpulse(dir.scale(150), hit.pickedPoint);
 
                }
            }
            
            function destroyGameElement() {
                cannonfoot.dispose();
                cannontube.dispose();
                rect1.dispose();
                rect2.dispose();
                rect3.dispose();
                button1.dispose();
                scoreImage.dispose();
            }
            
            // Create a game over screen
            function gameOverScreen () {
                var iconImage = new BABYLON.GUI.Image("aero" + "_icon", "images/5.png");
                iconImage.width = 1;
                iconImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                iconImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                iconImage.top = "-250px";

                var gameOverScreen = new BABYLON.GUI.Rectangle();
                gameOverScreen.width = 1;
                gameOverScreen.height = 0.4;
                gameOverScreen.color = "#C8099B";
                gameOverScreen.alpha = 0.9;
                gameOverScreen.cornerRadius = 20;
                gameOverScreen.thickness = 10;
                gameOverScreen.background = "#46209F";
                gameOverScreen.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                gameOverScreen.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                gameOverScreen.top = "50px";
                
                var gameOverText = new BABYLON.GUI.TextBlock();
                gameOverText.text = "Game Over";
                gameOverText.color = "White";
                gameOverText.fontSize = 50;
                gameOverText.top = "-110px";
                //gameOverText.left = "-140px";
                gameOverText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                gameOverText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

                var xp = 0;
                if(point >= enemyCount)  xp = 200 + point*10;
                else if(point >= Math.round(enemyCount/2)) xp = 100 + point*10;
                else if(point >= Math.round(enemyCount/4)) xp = 50 + point*10;
                else  xp = point*10;

                var xpText = new BABYLON.GUI.TextBlock();
                xpText.text = "XP\n"+xp;
                xpText.color = "orange";
                xpText.fontSize = 25;
                xpText.top = "-40px";
                xpText.left = "-140px";
                xpText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                xpText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                
                var shootText = new BABYLON.GUI.TextBlock();
                shootText.text = "Shoot\n"+shootCounter;
                shootText.color = "orange";
                shootText.fontSize = 25;
                shootText.top = "-40px";
                shootText.left = "0px";
                shootText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                shootText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

                var smashText = new BABYLON.GUI.TextBlock();
                smashText.text = "Smash\n"+point;
                smashText.color = "orange";
                smashText.fontSize = 25;
                smashText.top = "-40px";
                smashText.left = "130px";
                smashText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                smashText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

                var playAgainText = new BABYLON.GUI.TextBlock();
                playAgainText.text = "Let's Play Again!";
                playAgainText.color = "white";
                playAgainText.fontSize = 25;
                playAgainText.top = "40px";
                playAgainText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                playAgainText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            
                var yesButton = BABYLON.GUI.Button.CreateSimpleButton("yesButton", "Yes");
                yesButton.width = 0.3;
                yesButton.height = "60px";
                yesButton.color = "White";
                yesButton.cornerRadius = 20;
                yesButton.background = "#C8099B";
                yesButton.top = "0px";
                yesButton.left = "-60px";
                yesButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                yesButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                yesButton.onPointerUpObservable.add(function() {
                    //alert("coming soon...\nRefresh page to play again");
                    // Restart the game
                    //gamescreenEnable = false;
                    //gameOverScreen.dispose();
                    //iconImage.dispose();
                    //menuScreen();
                    location.reload();
                    
                });         

                var noButton = BABYLON.GUI.Button.CreateSimpleButton("noButton", "No");
                noButton.width = 0.3;
                noButton.height = "60px";
                noButton.color = "White";
                noButton.cornerRadius = 20;
                noButton.background = "#C8099B";
                noButton.top = "0px";
                noButton.left = "60px";
                noButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                noButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                noButton.onPointerUpObservable.add(function() {
                    alert("Thank you for playing\nSee you next time.");
                    // Restart the game
                    //gamescreenEnable = false;
                    //gameOverScreen.dispose();
                    //iconImage.dispose();
                    //menuScreen();
                    //engine.stopRenderLoop();
                    location.reload();
                }); 
                
                gameOverScreen.addControl(gameOverText);
                gameOverScreen.addControl(xpText);
                gameOverScreen.addControl(shootText);
                gameOverScreen.addControl(smashText);
                gameOverScreen.addControl(playAgainText);
                gameOverScreen.addControl(yesButton);
                gameOverScreen.addControl(noButton);

                var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                //var gameOverScreen = gameOverScreen();
                advancedTexture.addControl(iconImage); 
                advancedTexture.addControl(gameOverScreen);
                
                //return gameOverScreen;
            };      
  
            
            scene.registerBeforeRender(function (){ 
                
                if(gamescreenEnable == true && tracking == false){
                    //WEBARSDK.Init();
                    //WEBARSDK.StartTracking(true);
                    //WEBARSDK.DisableTracking(false);
                    //WEBARSDK.StopTracking(true);

                    //gameScreen();
                    gameScreenAddController();
                    generateEnemies();
                    tracking = true;
                    gamescreenEnable = false;
                    console.info(" startTracking");
                    
                }
                if(stageReadyVariable == 1 && gamescreenEnable == false)  {
                    instruction.text = 'press play to continue';
                    startButton.background = "#46209F";
                }
                
                if(stageReadyVariable == 1)  {
                    //console.info("render before"); 
      
                    if(life <= 0 && gameOverCheck == true || Math.floor(timecount) <= 0 && gameOverCheck == true) {
                        for(var i=0; i<enemy.length; i++) {
                            enemy[i].dispose();
                            gameOverCheck = false;
                            //tracking = false;
                        }
                        //showGameOverScreen();
                        destroyGameElement();
                        gameOverScreen();
                    }else if( enemy.length <= 0 && gameOverCheck == true){
                        destroyGameElement();
                        gameOverScreen();
                    }
                    
                    var lifeBar = "";
                    for(var i = 0; i < life; i++) lifeBar += "X";

                    label.text = "Smash \n " +point;
                    label1.text = "Life \n " + lifeBar;

                    /*for (var i = 0; i < enemy.length; i++) {
                        enemy[i].rotation.x = -Math.PI / 2; 
                    }*/

                    moveEnemies();
                        
                    /*try{
                        //const pos_mat  = WEBARSDK.GetCurrentPose();
                        const pos_mat  = WEBARSDK.GetCurrentPosition();
                        console.info("Pose Matrix", 
                        pos_mat[0],  pos_mat[1],  pos_mat[2],  pos_mat[3], "\n",
                        pos_mat[4],  pos_mat[5],  pos_mat[6],  pos_mat[7], "\n",
                        pos_mat[8],  pos_mat[9],  pos_mat[10], pos_mat[11], "\n",
                        pos_mat[12], pos_mat[13], pos_mat[14], pos_mat[15]);

                        const rot_mat = WEBARSDK.GetCurrentRotation();
                        console.info("Pure Rotation Matrix", 
                        pos_mat[0],  pos_mat[1],  pos_mat[2],  pos_mat[3], "\n",
                        pos_mat[4],  pos_mat[5],  pos_mat[6],  pos_mat[7], "\n",
                        pos_mat[8],  pos_mat[9],  pos_mat[10], pos_mat[11], "\n",
                        pos_mat[12], pos_mat[13], pos_mat[14], pos_mat[15]);
                    }
                    catch(err){
                        console.error("Error-",err);
                    }
                    */
                }
            });
              
            async function asynXPFlash () {
                var advancedTextureInRender = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

                // Adding image
                var xpImage = new BABYLON.GUI.Image("xp" + "_icon", "images/xp.png");
                xpImage.width = "50%";
                xpImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                xpImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                xpImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                xpImage.top = "-300px";
                xpImage.left = "60px";
                advancedTextureInRender.addControl(xpImage); 
                await BABYLON.Tools.DelayAsync(1000);
                xpImage.dispose();
            };
              
 
            scene.registerAfterRender(function() {
                if(point != oldPoint){
                    asynXPFlash();
                    oldPoint = point;
                }

            });

            scene.onBeforeRenderObservable.add((thisScene, state) => {
                if(tracking == true && Math.round(timecount) > 0 ) {
                    //console.info("Count - ");
                    if (!thisScene.deltaTime) return;
                    //console.info(count);
                    timecount -= (thisScene.deltaTime / 1000);
                    //if(count <= 0) return;
                    timeBlock.text = String(Math.round(timecount));
                }
            });
            
            
            menuScreen();
            
            gameElements();
            gameScreen();
            //generateEnemies();
            // Pass babylon canvas, scene, camera and webarStage mesh to WebarSdk to initialize surface tracking
            //WEBARSDK.Init();
            WEBARSDK.InitBabylonJs(canvas, scene, camera, webarStage);
            WEBARSDK.SetAutoScale(false);

            WEBARSDK.SetWebARMode("surface-tracking");//
            WEBARSDK.StartTracking();
            
            return scene;
        };

        /*
        var sparksystem = null;
        var smokesystem = null;

        var startParticles = function (scene, fountain) {
            let sphereSpark = BABYLON.MeshBuilder.CreateSphere("sphereSpark", {diameter: 0.4, segments: 32}, scene);
            sphereSpark.isVisible = false;
            sphereSpark.setParent(fountain);
            BABYLON.ParticleHelper.ParseFromFileAsync(null, "./models/spark_particles.json", scene, false).then(system => {
                sparksystem = system;
                system.emitter = sphereSpark;
            });
            let sphereSmoke = BABYLON.MeshBuilder.CreateSphere("sphereSmoke", {diameter: 1.9, segments: 32}, scene);
            sphereSmoke.isVisible = false;
            sphereSmoke.setParent(fountain);
            BABYLON.ParticleHelper.ParseFromFileAsync(null, "./models/smoke_particles.json", scene, false).then(system => {
                smokesystem = system;
                system.emitter = sphereSmoke;
            });
        };
        */

        window.initFunction = async function() {
            var asyncEngineCreation = async function() {
                try {
                    return createDefaultEngine();
                } catch(e) {
                console.log("the available createEngine function failed. Creating the default engine instead");
                    return createDefaultEngine();
                }
            }

            window.engine = await asyncEngineCreation();
            if (!engine) throw 'engine should not be null.';
            window.scene = createScene();
        };

        initFunction().then(() => {
            sceneToRender = window.scene;
            sceneToRender.executeWhenReady(function () {
                engine.runRenderLoop(function () {
                    if (sceneToRender && sceneToRender.activeCamera) {
                        sceneToRender.render();
                        
                    }
                });
            });
        });

        window.addEventListener("resize", function () {
            engine.resize();
        });

        WEBARSDK.SetStageReadyCallback(() => {
            console.info('Stage is ready now!!!');
            stageReadyVariable = 1;
            

            /*
            // Start spark and smoke particles
            var toggleCounter = 0;
            setInterval(() => {
                console.log('Restart spark');

                if (toggleCounter % 2 === 0) {
                    if (sparksystem !== null) {
                        sparksystem.stop();
                        sparksystem.reset();
                        sparksystem.start()
                    }
                }
                else {
                    if (smokesystem !== null) {
                        smokesystem.stop();
                        smokesystem.reset();
                        smokesystem.start();
                    }
                }

                ++toggleCounter;
            },
            3000);
            */
        });

        WEBARSDK.SetTrackingStartedCallback(() =>{
            console.info('Tracking has started');
         });

         WEBARSDK.SetTrackingStoppedCallback(() =>{
            console.info('Tracking has stopped');
         });

         WEBARSDK.SetTrackingQualityChangeCallback((trackingQuality) =>{
            console.info('Tracking quality: ', trackingQuality);
         });
