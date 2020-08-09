import {Request, Response} from 'express'
import db from '../database/connections';
import convertHoursToMinutes from '../utils/convertHoursToMinutes';

interface ScheduleItem {
    week_day: number,
    from: string,
    to: string
}

export default class ClassController{

    async index(req: Request, res: Response){
        const filters = req.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if(!week_day || !subject || !time){
            return res.status(400).json({
                "error" : "missing filters to filter classes"
            })
        }

        const timeInMinutes = convertHoursToMinutes(time);

        const classes = await db('classes')
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=' ,'users.id')
            .select(['classes.*', 'users.*'])

        return res.json(classes);
        
    }

    async create(req: Request, res: Response){
        const {
            name, 
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = req.body;
    
        const trx = await db.transaction();
    
        try{
            const insertedUsersIds = await trx('users').insert({name, avatar, whatsapp, bio})
            const user_id = insertedUsersIds[0];
        
            const isertedClassesIds = await trx('classes').insert({subject, cost, user_id})
            const class_id = isertedClassesIds[0];
        
            const classSchedule = schedule.map((scheduleItem: ScheduleItem)=>{
                return{
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHoursToMinutes(scheduleItem.from),
                    to: convertHoursToMinutes(scheduleItem.to)
                };
            });
        
            await trx('class_schedule').insert(classSchedule);
        
            await  trx.commit();
        
            return res.status(201).send();
        }catch(e){
            await trx.rollback();
            return res.status(400).json({
                "error": "unexpected error while creating classes"
            })
        }
    }
    
}