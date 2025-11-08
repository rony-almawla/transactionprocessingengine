
import bcrypt from "bcryptjs";

export const createUser = async (fastify, { email, password, role }) => {
    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error('Email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await fastify.prisma.user.create({
        data: { email, password: hashed, role },
        select: { id: true, email: true, role: true, createdAt: true }
    });

    return user;
};

export const authenticateUser = async (fastify, { email, password }) => {
    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');

    const token = fastify.jwt.sign({ userId: user.id, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
};

export const getAllUsers = async (fastify) => {
    const users = await fastify.prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true }
    });
    return users;
};

export const updateUser = async (fastify, id, data, currentUserRole) => {
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    if (data.role && currentUserRole !== 'ADMIN') {
        throw new Error('Only admins can change roles');
    }
    const updated = await fastify.prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, role: true, updatedAt: true }
    });
    return updated;
};

export const deleteUser = async (fastify, id) => {
    await fastify.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
};
