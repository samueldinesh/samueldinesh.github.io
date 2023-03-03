var canvas = document.getElementById("renderCanvas");

        var engine = null;
        var sceneToRender = null;
        var webarStage = null;
        var stageReadyVariable = 0;
        var gamescreenEnable = false;
        var tracking = false;

        var point =0;
        var life = 5;

        var enemyCount = 15;
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
            var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
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

            const bombSound = new BABYLON.Sound("bombSound", "music/silenced-gun.mp3", scene);

            var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(5, 10, -2), scene);
            light.intensity = 0.7;

            var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
            
            var instruction = null;
            var startButton = null;

            function menuScreen() {
                // create a GUI for the menu screen
                //var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

                // Adding image
                var iconImage = new BABYLON.GUI.Image("aero" + "_icon", "images/AERO.png");
                iconImage.width = "80%";
                iconImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                iconImage.top = "-250px";
                advancedTexture.addControl(iconImage); 

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
                startButton.width = "200px";
                startButton.height = "50px";
                startButton.color = "white";
                startButton.cornerRadius = 20;
                startButton.background = "gray";
                startButton.top = "150px";
                startButton.onPointerUpObservable.add(function() {
                    // start the game when the button is clicked
                    if( stageReadyVariable == 1){
                        startGame();
                    }
                    
                });
                advancedTexture.addControl(startButton);
                
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
                    gameOverCheck = true;

                    gamescreenEnable = true;
                }

            }
            var cannonfoot = null;
            var cannontube = null;
            var itarg = null;
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
                /*BABYLON.SceneLoader.ImportMesh('', "./models/model/", "drone.babylon", scene, function (meshes, particleSystems, skeletons) {
                
                    let xQuat = new BABYLON.Quaternion();
                    BABYLON.Quaternion.FromEulerAnglesToRef(Math.PI / 2, 0, 0, xQuat);

                    for (mesh of meshes) {
                        if (mesh.name !== '__root__') {
                            // Move the loaded models to webarStage
                            mesh.setParent(webarStage);
                            mesh.rotationQuaternion.multiplyInPlace(xQuat);

                            scaleByFactor(mesh, 0.0375);
                        }
                    }
                });*/

                //BABYLON.SceneLoader.ImportMesh("", "./models/model/", "drone.babylon", scene, function (newMeshes) {
                /*BABYLON.SceneLoader.ImportMesh("", "./models/model/", "bee.glb", scene, function (newMeshes) {
                        //var _i=0;
                        //newMeshes[0].setParent(webarStage);


                    for (mesh of newMeshes){
                        mesh.setParent(webarStage);
                        //_i += 1;
                        //console.info(_i);
                        //scaleByFactor(mesh, 0.5);
                    }
                //var buggy2 = newMeshes[0];
        
                //camera.target = buggy2;
                // buggy2.setParent(webarStage);
        

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
                
                cannontube = BABYLON.MeshBuilder.CreateCylinder("Tube", { height: 1, diameter: 0.4, tessellation: 16 }, scene);
                cannontube.position.set(0, 0, 0);
                //scaleByFactor(cannontube, 2);

                itarg = BABYLON.Mesh.CreateBox("targ", 0.5, scene);
                itarg.position.y = 3;
                itarg.visibility = .8;
                itarg.parent = cannontube;
                //scaleByFactor(itarg, 0.5);


                var objInXRStage = 0;
                if(objInXRStage == 1){
                    cannontube.rotation.set(3*Math.PI/2, 0, 0);

                    cannontube.parent = cannonfoot; 

                    cannonfoot.setParent(webarStage);
                    cannonfoot.position.set(0, -1, -2); //infront canon appears

                    cannontube.rotation.addInPlace(new BABYLON.Vector3(Math.PI/12, 0, 0));


                }else{           
                    cannontube.rotation.set(3*Math.PI/2, 6*Math.PI/2, 0);

                    cannontube.parent = cannonfoot; 

                    cannonfoot.setParent(camera);
                    cannonfoot.position.set(0, -5, 10); //infront canon appears

                    cannontube.position.addInPlace(new BABYLON.Vector3(0, 0, 1));
                    cannontube.rotation.addInPlace(new BABYLON.Vector3(Math.PI/12, 0, 0));

                }
            }
            var button1 = null;
            var rect1 = null;
            var rect2 = null;
            var label = null;
            var label2 = null;

            function gameScreen(){
                // GUI
                //var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Fire");
                button1.width = "150px"
                button1.height = "80px";
                button1.color = "white";
                button1.cornerRadius = 20;
                button1.background = "red";
                button1.onPointerDownObservable.add(function() {
                    //alert("you did it!");
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
                rect1.background = "green";
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
                rect2.background = "green";
                rect2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; //move button to bottem end
                rect2.top = "-40px"; // move button little over cannonfoot
                rect2.left = "140px"; // move button
                //advancedTexture.addControl(rect2);
    

                label1 = new BABYLON.GUI.TextBlock();
                label1.text = "Life \n " +life;
                //rect2.addControl(label1);
            }
            
            function gameScreenAddController() {
                advancedTexture.addControl(button1); 
                advancedTexture.addControl(rect1);
                rect1.addControl(label);
                advancedTexture.addControl(rect2);
                rect2.addControl(label1);

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

            function createEnemy2(name,x,y,z){
                //var enemyObj = BABYLON.MeshBuilder.CreateCylinder(name, { height: 0.5, diameter: 0.6, tessellation: 16 }, scene);
                var enemyObj = BABYLON.Mesh.CreateCylinder(name, 3, 3, 0, 6, 1, scene, false);
                enemyObj.material = new BABYLON.StandardMaterial("c6mat", scene);
                enemyObj.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
                enemyObj.position.set(x,y,z);
                enemyObj.physicsImpostor = new BABYLON.PhysicsImpostor(enemyObj, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
                //enemyObj.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(1, 5, 1));

                //effectOnMesh(enemyObj);
                console.info("enemy created");

                //scaleByFactor(enemyObj, 2);

                return enemyObj;
            }

            function createEnemy(name,x,y,z){
                var enemyObj = BABYLON.Mesh.CreateCylinder(name, 3, 3, 0, 6, 1, scene, false);
                enemyObj.material = new BABYLON.StandardMaterial("enemyMat", scene);
                enemyObj.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                enemyObj.position.set(x,y,z);
                enemyObj.physicsImpostor = new BABYLON.PhysicsImpostor(enemyObj, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restition: 0.3 }, scene);
            
                var moveSpeed = Math.random() * 0.5 + 0.55;//0.05 // randomly set movement speed for enemy
                var approachInterval = Math.random() * 1000 + 1000;//1000 // randomly set time interval for enemy to approach player
                //console.info(name+"  :movespeed-"+moveSpeed+"  approachInterval "+ approachInterval);
                enemyObj.move = function() {
                    var min = -0.1;
                    var max = 0.1;
                    // move the enemy in random direction
                    var x = Math.random() * 0.2 - 0.1;
                    var z = Math.random() * 0.25 - 0.1; //0.23
                 
                    this.position.addInPlace(new BABYLON.Vector3(x, 0, z));
                    //console.info(this+"-"+this.position);
                    // calculate distance to player
                    var distance = BABYLON.Vector3.Distance(this.position, cannonfoot.position);
            
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
                        /*var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
                        particleSystem.particleTexture = new BABYLON.Texture("textures/Flare.png", scene);
                        particleSystem.emitter = this;
                        particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
                        particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
                        particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
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
                        particleSystem.start();
                        */
                        this.dispose();
                        //.dispose();
                        life -= 1;
                        if(life <= 0) life = 0;
                        var index = enemy.indexOf(this);
                        if (index !== -1) {
                            enemy.splice(index, 1);
                            console.log(enemy); // output the enemy array
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
                for(var i=0; i< enemyCount; i++){
                    
                    //randomInteger(-5,10)
                    enemy[i] = createEnemy("enemy"+i,randomInteger(-20,20),randomInteger(-15,20),-80);
                    //en.checkCollision = true;
                    enemy[i].setParent(webarStage);
            
                    //enemy[i] = createEnemy();
                    //webarStage.addChild(createEnemy());
                    //scaleByFactor(enemy[i], 2);
                    
                }
            }

            function firebullet (power) {
                var bullet = BABYLON.MeshBuilder.CreateSphere("Bullet", { segments: 3, diameter: 0.5}, scene);
                bullet.position = cannontube.getAbsolutePosition();
                //bullet.scale.y += 1.0;
                bullet.isPickable = false; 
                bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, friction: 0.5, restition: 0.9 }, scene);
                
                bullet.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(1, 1, -10));
                //scaleByFactor(bullet, 0.4);

                const sphereMaterial = new BABYLON.StandardMaterial("material", scene);
                sphereMaterial.diffuseColor = BABYLON.Color3.Random();
                bullet.material = sphereMaterial;

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
                    castRay(bullet);
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
                hit.pickedMesh.dispose();
                
                point +=1;


                //hit.pickedMesh.scaling.x += 10
                //var dir = hit.pickedPoint.subtract(scene.activeCamera.position);
                //dir.normalize();
                //hit.pickedMesh.applyImpulse(dir.scale(150), hit.pickedPoint);
 
                }
            }
            
            
            // Create a game over screen
            function createGameOverScreen () {
                var iconImage = new BABYLON.GUI.Image("aero" + "_icon", "images/AERO.png");
                iconImage.width = "80%";
                iconImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
                iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                iconImage.top = "-250px";

                var gameOverScreen = new BABYLON.GUI.Rectangle();
                gameOverScreen.width = 0.8;
                gameOverScreen.height = 0.4;
                gameOverScreen.color = "black";
                gameOverScreen.alpha = 0.8;
                gameOverScreen.cornerRadius = 20;
                gameOverScreen.thickness = 4;
                gameOverScreen.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                gameOverScreen.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            
                var gameOverText = new BABYLON.GUI.TextBlock();
                gameOverText.text = "Game Over!";
                gameOverText.color = "white";
                gameOverText.fontSize = 48;
                gameOverText.top = "-40px";
                gameOverText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                gameOverText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            
                var restartButton = BABYLON.GUI.Button.CreateSimpleButton("restartButton", "Restart");
                restartButton.width = 0.4;
                restartButton.height = "60px";
                restartButton.color = "white";
                restartButton.cornerRadius = 20;
                restartButton.background = "green";
                restartButton.top = "40px";
                restartButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                restartButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                restartButton.onPointerUpObservable.add(function() {
                    // Restart the game
                    //gamescreenEnable = false;
                    //gameOverScreen.dispose();
                    //iconImage.dispose();
                    //menuScreen();
                });              
                
                gameOverScreen.addControl(gameOverText);
                gameOverScreen.addControl(restartButton);

                var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                //var gameOverScreen = createGameOverScreen();
                advancedTexture.addControl(iconImage); 
                advancedTexture.addControl(gameOverScreen);
                
                //return gameOverScreen;
            };
            
            // Show the game over screen
            function showGameOverScreen () {
                var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                var gameOverScreen = createGameOverScreen();
                advancedTexture.addControl(gameOverScreen);
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
                    startButton.background = "green";
                }
                
                if(stageReadyVariable == 1)  {
                    //console.info("render before"); 

                    
                    if(life <= 0 && gameOverCheck == true) {
                        for(var i=0; i<enemy.length; i++) {
                            enemy[i].dispose();
                            gameOverCheck = false;
                        }
                        //showGameOverScreen();
                        createGameOverScreen();
                    }
                    label.text = "Smash \n " +point;
                    label1.text = "Life \n " +life;

                    /*for (var i = 0; i < enemy.length; i++) {
                        enemy[i].rotation.x = -Math.PI / 2; 
                    }*/
                    moveEnemies();
                    /*for (var i = 0; i < enemy.length; i++) {
                        moveEnemy(enemy[i]);
                        console.info("enenmy"+i+" before render move");
                    }*/
                        
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

            
            scene.registerAfterRender(function() {

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
