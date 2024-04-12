class CanvassesController < ApplicationController
  before_action :set_canvass,       except: [:index, :create]
  before_action :authorize_canvass, except: [:index, :create]

  def index
    @canvasses = current_user.canvasses
  end

  def show
  end

  def create
    @canvass = Canvass.create(user: current_user)

    redirect_to canvass_path(@canvass)
  end

  def update
    @canvass.assign_attributes(canvass_params)

    if @canvass.save
      render json: { success: true }, status: 204
    else
      render json: { success: false }, status: 422
    end
  end

  def destroy
    @canvass.destroy
    redirect_back fallback_location: canvasses_path
  end

  def contents
    @contents = @canvass.contents

    render json: { contents: @contents }, content_type: 'application/json', status: 200
  end

  def clear
    @canvass.contents.destroy_all

    redirect_back fallback_location: canvasses_path
  end

  private

  def set_canvass
    @canvass = Canvass.find(params[:id])
  end

  def authorize_canvass
    unless current_user.canvasses.where(id: @canvass.id).exists?
      return redirect_to canvasses_path
    end
  end

  def canvass_params
    params.require(:canvass).permit(
      :name)
  end
end