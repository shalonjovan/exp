import pygame
import sys
import math

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("3D Rubik's Cube")

clock = pygame.time.Clock()

# Cube vertices
vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
]

# Faces (each face is 4 vertex indices)
faces = [
    (0, 1, 2, 3),  # back
    (4, 5, 6, 7),  # front
    (0, 1, 5, 4),  # bottom
    (2, 3, 7, 6),  # top
    (1, 2, 6, 5),  # right
    (0, 3, 7, 4),  # left
]

# Rubik's colors
colors = [
    (255, 0, 0),     # red
    (0, 255, 0),     # green
    (0, 0, 255),     # blue
    (255, 255, 0),   # yellow
    (255, 165, 0),   # orange
    (255, 255, 255), # white
]

angle_x = 0
angle_y = 0
angle_z = 0

def rotate_x(point, angle):
    x, y, z = point
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    return [x,
            y * cos_a - z * sin_a,
            y * sin_a + z * cos_a]

def rotate_y(point, angle):
    x, y, z = point
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    return [z * sin_a + x * cos_a,
            y,
            z * cos_a - x * sin_a]

def rotate_z(point, angle):
    x, y, z = point
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    return [x * cos_a - y * sin_a,
            x * sin_a + y * cos_a,
            z]

def project(point):
    x, y, z = point
    distance = 5
    factor = 400 / (z + distance)
    return (int(x * factor + WIDTH // 2),
            int(-y * factor + HEIGHT // 2))

while True:
    clock.tick(60)
    screen.fill((15, 15, 30))

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    transformed = []
    for v in vertices:
        r = rotate_x(v, angle_x)
        r = rotate_y(r, angle_y)
        r = rotate_z(r, angle_z)
        transformed.append(r)

    projected = [project(v) for v in transformed]

    # Depth sorting (Painter's Algorithm)
    face_list = []
    for i, face in enumerate(faces):
        z_avg = sum(transformed[v][2] for v in face) / 4
        face_list.append((z_avg, face, colors[i]))

    face_list.sort(reverse=True)

    # Draw faces
    for _, face, color in face_list:
        points = [projected[i] for i in face]
        pygame.draw.polygon(screen, color, points)
        pygame.draw.polygon(screen, (0,0,0), points, 2)  # black border

        # Draw Rubik-style grid lines
        for i in range(1,3):
            # Horizontal lines
            p1 = (
                points[0][0] + (points[3][0]-points[0][0]) * i/3,
                points[0][1] + (points[3][1]-points[0][1]) * i/3
            )
            p2 = (
                points[1][0] + (points[2][0]-points[1][0]) * i/3,
                points[1][1] + (points[2][1]-points[1][1]) * i/3
            )
            pygame.draw.line(screen, (0,0,0), p1, p2, 1)

            # Vertical lines
            p3 = (
                points[0][0] + (points[1][0]-points[0][0]) * i/3,
                points[0][1] + (points[1][1]-points[0][1]) * i/3
            )
            p4 = (
                points[3][0] + (points[2][0]-points[3][0]) * i/3,
                points[3][1] + (points[2][1]-points[3][1]) * i/3
            )
            pygame.draw.line(screen, (0,0,0), p3, p4, 1)

    angle_x += 0.01
    angle_y += 0.02
    angle_z += 0.015

    pygame.display.flip()