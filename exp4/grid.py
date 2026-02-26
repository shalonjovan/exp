from ursina import *

app = Ursina()

for x in range(-1,2):
    for y in range(-1,2):
        for z in range(-1,2):
            Entity(
                model='cube',
                color=color.random_color(),
                position=(x,y,z),
                scale=0.9
            )

EditorCamera()
app.run()