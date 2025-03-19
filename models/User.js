const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, 'Имя обязательно для заполнения'] 
    },
    lastName: { 
        type: String, 
        required: [true, 'Фамилия обязательна для заполнения'] 
    },
    patronymic: { 
        type: String, 
        required: false // Необязательное поле
    },
    position: { 
        type: String, 
        required: [true, 'Должность обязательна для заполнения'] 
    },
    educationalInstitution: {
        type: String,
        required: [true, 'Учебное заведение обязательно для заполнения']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Номер телефона обязателен'],
        unique: true,
        validate: {
            validator: function(v) {
                return /^\+?[1-9]\d{1,14}$/.test(v); // Валидация международного формата
            },
            message: props => `${props.value} не является валидным номером телефона!`
        }
    },
    email: { 
        type: String, 
        required: [true, 'Email обязателен'], 
        unique: true,
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} не является валидным email!`
        }
    },
    password: { 
        type: String, 
        required: [true, 'Пароль обязателен'] 
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'institution', 'user'],
            message: 'Недопустимая роль пользователя'
        },
        required: [true, 'Роль обязательна для заполнения']
    }
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);