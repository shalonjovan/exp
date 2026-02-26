from ursina import *

app = Ursina()

cube = Entity(
    model='cube',
    color=color.orange,
    scale=2
)

EditorCamera()  # allows mouse control

app.run()