import 'dart:developer';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ready_ecommerce/config/app_constants.dart';
import 'package:ready_ecommerce/models/eCommerce/address/areas_model.dart';
import 'package:ready_ecommerce/utils/api_client.dart';

class AreasControllerNotifier extends StateNotifier<AsyncValue<List<AreasModel>>>{
  final Ref ref;

  AreasControllerNotifier(this.ref): super(AsyncLoading()){
    getAreasList();
  }

    Future<void>getAreasList()async{
     try{
       final response = await ref.read(apiClientProvider).get(AppConstants.areasListUrl);

       if(response.statusCode == 200){
         List<dynamic> jsonResponse = response.data['data']['areas'];

         final areasList = jsonResponse.map((json) => AreasModel.fromJson(json)).toList();

         state = AsyncData(areasList);

       }else {
         throw Exception(response.data['message']);
       }
     }catch(error,stackTrace){
       log("offer_api error: $error");
       log("offer_api stackTrace: $stackTrace");

       state = AsyncError(error, stackTrace);
     }

    }

}

final areasProvider = StateNotifierProvider<AreasControllerNotifier,AsyncValue<List<AreasModel>>>((ref){
  return AreasControllerNotifier(ref);
});