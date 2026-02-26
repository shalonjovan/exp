from ursina import *

app = Ursina()

cube = Entity(
    model='cube',
    color=color.azure,
    scale=2
)

EditorCamera()

def update():
    cube.rotation_x += 40 * time.dt
    cube.rotation_y += 60 * time.dt

app.run()