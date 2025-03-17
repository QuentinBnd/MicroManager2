"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
class UserController {
    static getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield UserRepository_1.UserRepository.find();
                res.status(200).json(users);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield UserRepository_1.UserRepository.findOneBy({ userId: parseInt(id) });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.status(200).json(user);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = UserRepository_1.UserRepository.create(req.body);
                yield UserRepository_1.UserRepository.save(newUser);
                res.status(201).json(newUser);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield UserRepository_1.UserRepository.findOneBy({ userId: parseInt(id) });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                UserRepository_1.UserRepository.merge(user, req.body);
                const updatedUser = yield UserRepository_1.UserRepository.save(user);
                res.status(200).json(updatedUser);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield UserRepository_1.UserRepository.findOneBy({ userId: parseInt(id) });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                yield UserRepository_1.UserRepository.remove(user);
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
}
exports.UserController = UserController;
